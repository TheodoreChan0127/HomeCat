import { DataSource } from "typeorm"
import  Cat  from "../entity/Cat"
import ormconfig from "../../ormconfig.json"

const AppDataSource = new DataSource({  ...(ormconfig as import("typeorm").DataSourceOptions),  entities: [Cat]})

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
  })

export const getCatRepository = () => AppDataSource.getRepository(Cat)