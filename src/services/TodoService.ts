import { Todo } from "../entity/Todo";
import { CatDbProxy } from "../db/CatDbProxy";
import { CatService } from "./CatService";
import { getConfigSettings } from "../config/configSettings";
import { getPregnancySettings } from "../config/pregnancySettings";
import dayjs from "dayjs";
import { Cat } from "../entity/Cat";
import { WeightRecord } from "../entity/WeightRecord";
import { VaccinationRecord } from "../entity/VaccinationRecord";
import { ExternalDeworming } from "../entity/ExternalDeworming";
import { InternalDeworming } from "../entity/InternalDeworming";

export class TodoService {
  private static instance: TodoService;
  private db: typeof CatDbProxy;
  private catService: CatService;
  private isProcessing = false;

  private constructor() {
    this.db = CatDbProxy;
    this.catService = CatService.getInstance();
  }

  public static getInstance(): TodoService {
    if (!TodoService.instance) {
      TodoService.instance = new TodoService();
    }
    return TodoService.instance;
  }

  // 处理所有猫咪的TODO
  public async processAllTodos(): Promise<void> {
    if (this.isProcessing) {
      console.log("TODO正在处理中，跳过本次处理");
      return;
    }

    try {
      this.isProcessing = true;
      console.log("开始处理所有猫咪的TODO...");

      // 先更新所有猫咪状态
      await this.catService.updateAllCatsStatus();

      const cats = await CatDbProxy.getCats({
        currentPage: 1,
        itemsPerPage: 100,
        filters: {},
      });
      console.log(`找到 ${cats.data.length} 只猫咪`);

      for (const cat of cats.data) {
        console.log(`开始处理${cat.name} 的TODO...`);
        await this.processCatTodos(cat);
      }
      console.log("所有猫咪的TODO处理完成");
    } finally {
      this.isProcessing = false;
    }
  }

  // 处理单个猫咪的TODO
  private async processCatTodos(cat: Cat): Promise<void> {
    const config = getConfigSettings();
    const pregnancyConfig = getPregnancySettings();

    // 处理年龄TODO
    if (cat.birthDate) {
      await this.processAgeTodo(cat, config.ageReminderInterval);
    }

    // 处理体重TODO
    const weightRecords = await CatDbProxy.getWeightRecordsByCatId(cat.id);
    if (weightRecords.length > 0) {
      await this.processWeightTodo(cat, config.weightReminderInterval);
    } else {
      // 如果没有体重记录，创建初始记录并生成TODO
      if (cat.weight > 0) {
        const weightRecord = new WeightRecord();
        weightRecord.catId = cat.id;
        weightRecord.weight = cat.weight;
        weightRecord.weighDate = new Date().toISOString();
        await CatDbProxy.addWeightRecord(weightRecord);
        await this.processWeightTodo(cat, config.weightReminderInterval);
      } else {
        // 如果连体重都没有，创建称重TODO
        await this.createTodo(
          cat.id,
          `[称重提醒] ${cat.name} 需要称重了，这是首次称重`
        );
      }
    }

    // 处理疫苗TODO
    const vaccinations = await CatDbProxy.getVaccinationsByCatId(cat.id);
    if (vaccinations.length > 0) {
      await this.processVaccineTodo(cat, config.vaccineReminderInterval);
    } else {
      // 如果没有疫苗记录，创建初始记录并生成TODO
      if (cat.isVaccinated) {
        const vaccination = new VaccinationRecord();
        vaccination.catId = cat.id;
        vaccination.vaccineBrand = "初始疫苗";
        vaccination.injectionDate = new Date().toISOString();
        await CatDbProxy.addVaccinationRecord(vaccination);
        await this.processVaccineTodo(cat, config.vaccineReminderInterval);
      } else {
        // 如果未接种疫苗，创建疫苗TODO
        await this.createTodo(
          cat.id,
          `[疫苗提醒] ${cat.name} 需要注射疫苗了，这是首次接种`
        );
      }
    }

    // 处理驱虫TODO
    const externalDewormings = await CatDbProxy.getExternalDewormingsByCatId(
      cat.id
    );
    const internalDewormings = await CatDbProxy.getInternalDewormingsByCatId(
      cat.id
    );
    if (externalDewormings.length > 0 || internalDewormings.length > 0) {
      await this.processDewormTodo(
        cat,
        config.externalDewormingInterval,
        config.internalDewormingInterval
      );
    } else {
      // 如果没有驱虫记录，创建初始记录并生成TODO
      if (cat.isDewormed) {
        const externalDeworming = new ExternalDeworming();
        externalDeworming.catId = cat.id;
        externalDeworming.brand = "初始体外驱虫";
        externalDeworming.dewormingDate = new Date().toISOString();
        await CatDbProxy.addExternalDeworming(externalDeworming);

        const internalDeworming = new InternalDeworming();
        internalDeworming.catId = cat.id;
        internalDeworming.brand = "初始体内驱虫";
        internalDeworming.dewormingDate = new Date().toISOString();
        await CatDbProxy.addInternalDeworming(internalDeworming);

        await this.processDewormTodo(
          cat,
          config.externalDewormingInterval,
          config.internalDewormingInterval
        );
      } else {
        // 如果未驱虫，创建驱虫TODO
        await this.createTodo(
          cat.id,
          `[体外驱虫提醒] ${cat.name} 需要进行体外驱虫了，这是首次驱虫`
        );
        await this.createTodo(
          cat.id,
          `[体内驱虫提醒] ${cat.name} 需要进行体内驱虫了，这是首次驱虫`
        );
      }
    }

    // 处理怀孕TODO
    if (cat.isPregnant && pregnancyConfig.enableReminders) {
      await this.processPregnancyTodo(cat);
    }
  }

  // 处理年龄TODO
  private async processAgeTodo(cat: Cat, interval: number): Promise<void> {
    const birthDate = dayjs(cat.birthDate);
    const nextBirthday = birthDate.add(cat.age + 1, "year");
    const today = dayjs();
    const daysUntilBirthday = nextBirthday.diff(today, "day");

    if (daysUntilBirthday <= interval) {
      await this.createTodo(
        cat.id,
        `[年龄提醒] ${cat.name} 即将迎来 ${
          cat.age + 1
        } 岁生日，预计日期：${nextBirthday.format("YYYY-MM-DD")}`
      );
    }
  }

  // 处理体重TODO
  private async processWeightTodo(cat: Cat, interval: number): Promise<void> {
    const weightRecords = await CatDbProxy.getWeightRecordsByCatId(cat.id);
    if (weightRecords.length > 0) {
      const lastWeighDate = dayjs(
        weightRecords[weightRecords.length - 1].weighDate
      );
      const nextWeighDate = lastWeighDate.add(interval, "day");
      const today = dayjs();

      // 如果已经超过下次称重时间，才创建TODO
      if (today.isAfter(nextWeighDate)) {
        await this.createTodo(
          cat.id,
          `[称重提醒] ${
            cat.name
          } 需要称重了，上次称重时间：${lastWeighDate.format("YYYY-MM-DD")}`
        );
      }

      // 检查体重是否增加
      if (weightRecords.length >= 2) {
        const lastWeight = weightRecords[weightRecords.length - 1].weight;
        const previousWeight = weightRecords[weightRecords.length - 2].weight;
        if (lastWeight <= previousWeight) {
          await this.createTodo(
            cat.id,
            `[体重不增加提醒] ${cat.name} 的体重没有增加，请关注。上次体重：${lastWeight}kg，上上次体重：${previousWeight}kg`
          );
        }
      }
    }
  }

  // 处理疫苗TODO
  private async processVaccineTodo(cat: Cat, interval: number): Promise<void> {
    const vaccinations = await CatDbProxy.getVaccinationsByCatId(cat.id);
    if (vaccinations.length > 0) {
      const lastVaccineDate = dayjs(
        vaccinations[vaccinations.length - 1].injectionDate
      );
      const nextVaccineDate = lastVaccineDate.add(interval, "day");
      const today = dayjs();

      // 如果已经超过下次注射时间，才创建TODO
      if (today.isAfter(nextVaccineDate)) {
        await this.createTodo(
          cat.id,
          `[疫苗提醒] ${
            cat.name
          } 需要注射疫苗了，上次注射时间：${lastVaccineDate.format(
            "YYYY-MM-DD"
          )}`
        );
      }
    }
  }

  // 处理驱虫TODO
  private async processDewormTodo(
    cat: Cat,
    externalInterval: number,
    internalInterval: number
  ): Promise<void> {
    // 处理体外驱虫
    const externalDewormings = await CatDbProxy.getExternalDewormingsByCatId(
      cat.id
    );
    if (externalDewormings.length > 0) {
      const lastDewormDate = dayjs(
        externalDewormings[externalDewormings.length - 1].dewormingDate
      );
      const nextDewormDate = lastDewormDate.add(externalInterval, "day");
      const today = dayjs();

      // 如果已经超过下次驱虫时间，才创建TODO
      if (today.isAfter(nextDewormDate)) {
        await this.createTodo(
          cat.id,
          `[体外驱虫提醒] ${
            cat.name
          } 需要进行体外驱虫了，上次驱虫时间：${lastDewormDate.format(
            "YYYY-MM-DD"
          )}`
        );
      }
    }

    // 处理体内驱虫
    const internalDewormings = await CatDbProxy.getInternalDewormingsByCatId(
      cat.id
    );
    if (internalDewormings.length > 0) {
      const lastDewormDate = dayjs(
        internalDewormings[internalDewormings.length - 1].dewormingDate
      );
      const nextDewormDate = lastDewormDate.add(internalInterval, "day");
      const today = dayjs();

      // 如果已经超过下次驱虫时间，才创建TODO
      if (today.isAfter(nextDewormDate)) {
        await this.createTodo(
          cat.id,
          `[体内驱虫提醒] ${
            cat.name
          } 需要进行体内驱虫了，上次驱虫时间：${lastDewormDate.format(
            "YYYY-MM-DD"
          )}`
        );
      }
    }
  }

  // 处理怀孕TODO
  private async processPregnancyTodo(cat: Cat): Promise<void> {
    const pregnancies = await CatDbProxy.getPregnanciesByCatId(cat.id);
    if (pregnancies.length > 0) {
      const currentPregnancy = pregnancies[pregnancies.length - 1];
      if (!currentPregnancy.isDelivered) {
        const reminder1Day = dayjs(currentPregnancy.reminder1Day);
        const reminder3Day = dayjs(currentPregnancy.reminder3Days);
        const reminder7Day = dayjs(currentPregnancy.reminder7Days);
        const today = dayjs();

        // 检查7天提醒
        if (reminder7Day.diff(today, "day") <= 0) {
          await this.createTodo(
            cat.id,
            `[预产提醒] ${
              cat.name
            } 预计7天后生产，预产期：${reminder7Day.format("YYYY-MM-DD")}`
          );
        }
        // 检查3天提醒
        if (reminder3Day.diff(today, "day") <= 0) {
          await this.createTodo(
            cat.id,
            `[预产提醒] ${
              cat.name
            } 预计3天后生产，预产期：${reminder3Day.format("YYYY-MM-DD")}`
          );
        }
        // 检查1天提醒
        if (reminder1Day.diff(today, "day") <= 0) {
          await this.createTodo(
            cat.id,
            `[预产提醒] ${
              cat.name
            } 预计1天后生产，预产期：${reminder1Day.format("YYYY-MM-DD")}`
          );
        }
      }
    }
  }

  // 创建TODO
  private async createTodo(catId: number, content: string): Promise<void> {
    // 检查是否已存在相同的TODO
    const existingTodos = await CatDbProxy.getTodosByCatId(catId);
    const isDuplicate = existingTodos.some(
      (todo: Todo) => todo.content === content && todo.status === "pending"
    );

    if (isDuplicate) {
      console.log(`跳过重复的TODO: ${content}`);
      return;
    }

    const todo = new Todo();
    todo.catId = catId;
    todo.content = content;
    todo.status = "pending";
    todo.created_at = new Date().toISOString();
    todo.updated_at = new Date().toISOString();

    await CatDbProxy.addTodo(todo);
    console.log(`创建TODO: ${content}`);
  }

  // 获取所有待处理的TODO
  public async getPendingTodos(): Promise<Todo[]> {
    await this.processAllTodos();
    const todos = await CatDbProxy.getPendingTodos();
    console.log(`获取到 ${todos.length} 条待处理TODO`);
    return todos;
  }

  // 完成TODO
  public async completeTodo(todoId: number): Promise<void> {
    try {
      await CatDbProxy.completeTodo(todoId);
      console.log(`成功完成TODO: ${todoId}`);
    } catch (error) {
      console.error(`完成TODO失败: ${todoId}`, error);
      throw error;
    }
  }
}
