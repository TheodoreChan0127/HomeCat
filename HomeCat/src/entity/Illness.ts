import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { PetStatus } from './PetStatus'

@Entity()
export class Illness {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => PetStatus, petStatus => petStatus.illnesses)
  @JoinColumn()
  petStatus: PetStatus = undefined as any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  illnessName: string = '' // 患病名称

  @Column({ type: 'varchar', length: 500, nullable: true })
  treatmentMethod: string = '' // 治疗方法
}