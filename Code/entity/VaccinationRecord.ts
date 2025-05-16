import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { PetStatus } from './PetStatus'

@Entity()
export class VaccinationRecord {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => PetStatus, petStatus => petStatus.vaccinationRecords)
  @JoinColumn()
  petStatus: PetStatus = undefined as any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vaccineBrand: string = ''

  @Column({ type: 'date', nullable: true })
  injectionDate: Date = new Date()
}