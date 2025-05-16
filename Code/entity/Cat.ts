import { PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { PetStatus } from "./PetStatus"

export interface CatFilters {
  isPregnant?: boolean
  isSick?: boolean
  isVaccinated?: boolean
  isDewormed?: boolean
}
export class Cat {
  @PrimaryGeneratedColumn()
  id: number = 0 // 宠物编号

  @Column({ length: 50 })
  name: string = '' // 名字

  @Column({ nullable: true })
  age: number  = -1// 年龄

  @Column({ nullable: true })
  fatherId: number  = -1// 父宠物编号（外键）

  @Column({ nullable: true })
  motherId: number = -1// 母宠物编号（外键）

  @Column({ length: 20 })
  animalType: string = '猫' // 动物大类

  @Column({ length: 30 })
  breed: string = '' // 品种

  @Column({ length: 20 })
  color: string = '' // 花色

  @Column({ type: 'date' })
  birthDate: Date = new Date() // 生日

  @Column({ type: 'date' })
  arrivalDate: Date = new Date() // 到家日期

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalIncome: number = 0 // 单猫收益总计

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalExpense: number = 0 // 单猫支出总计

  @OneToOne(() => PetStatus, petStatus => petStatus.cat)
  petStatus: PetStatus = undefined as any // 宠物状态

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number = 0 // 体重

  @Column({ type: 'boolean', default: false })
  isPregnant: boolean = false // 是否怀孕

  @Column({ type: 'boolean', default: false })
  isSick: boolean = false // 是否生病

  @Column({ type: 'boolean', default: false })
  isVaccinated: boolean = false // 是否接种疫苗

  @Column({ type: 'boolean', default: false })
  isDewormed: boolean = false // 是否驱虫

  constructor(name: string = '') {
    this.name = name
  }

  static buildStatusFilters(filters: Pick<CatFilters, 'isPregnant' | 'isSick' | 'isVaccinated' | 'isDewormed'>): Partial<Cat> {
    const where: Partial<Cat> = {}
    if (filters.isPregnant !== undefined) where.isPregnant = filters.isPregnant
    if (filters.isSick !== undefined) where.isSick = filters.isSick
    if (filters.isVaccinated !== undefined) where.isVaccinated = filters.isVaccinated
    if (filters.isDewormed !== undefined) where.isDewormed = filters.isDewormed
    return where
  }
}