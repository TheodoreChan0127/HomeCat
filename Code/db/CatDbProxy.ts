import { getCatRepository } from './DBManager'
import { Cat } from '../entity/Cat'

interface CatFilters {
  name: string
  breed: string
  isPregnant: boolean
  isSick: boolean
  isVaccinated: boolean
  isDewormed: boolean
}

export const CatDbProxy = {
  getCats: async (currentPage: number, itemsPerPage: number, filters: CatFilters) => {
    const repository = await getCatRepository()
    const skip = (currentPage - 1) * itemsPerPage
    const whereClause: Partial<Cat> = {}
    if (filters.name) whereClause.name = filters.name
    if (filters.breed) whereClause.breed = filters.breed
    Object.assign(whereClause, Cat.buildStatusFilters(filters))

    const [data, total] = await repository.findAndCount({
      where: whereClause,
      skip,
      take: itemsPerPage
    })
    const totalPages = Math.ceil(total / itemsPerPage) || 1
    return { data, total, totalPages }
  },

  addCat: async (newCat: Omit<Cat, 'id'>) => {
    const repository = await getCatRepository()
    const cat = repository.create(newCat)
    await repository.save(cat)
  }
}