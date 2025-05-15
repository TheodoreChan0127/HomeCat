import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { Cat } from './Cat'
import { Pregnant } from './Pregnant'
import { VaccinationRecord } from './VaccinationRecord'
import { ExternalDeworming } from './ExternalDeworming'
import { Illness } from './Illness'
import { InternalDeworming } from './InternalDeworming'

@Entity()
export class PetStatus {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number[] = []

  @Column({ type: 'date', nullable: true })
  lastWeightDate: Date = new Date()

  @Column({ type: 'text', nullable: true })
  diet: string = ''

  @OneToMany(() => Pregnant, pregnant => pregnant.petStatus)
  pregnancies: Pregnant[] = []

  @OneToMany(() => VaccinationRecord, vaccinationRecord => vaccinationRecord.petStatus)
  vaccinationRecords: VaccinationRecord[] = []

  @OneToMany(() => ExternalDeworming, externalDeworming => externalDeworming.petStatus)
  externalDewormings: ExternalDeworming[] = []

  @OneToMany(() => Illness, illness => illness.petStatus)
  illnesses: Illness[] = []

  @OneToMany(() => InternalDeworming, internalDeworming => internalDeworming.petStatus)
  internalDewormings: InternalDeworming[] = []

  @OneToOne(() => Cat, cat => cat.petStatus)
  @JoinColumn()
  cat: Cat = undefined as any
}