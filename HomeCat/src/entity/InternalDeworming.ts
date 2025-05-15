import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { PetStatus } from './PetStatus'

@Entity()
export class InternalDeworming {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => PetStatus, petStatus => petStatus.internalDewormings)
  @JoinColumn()
  petStatus: PetStatus = undefined as any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string = ''

  @Column({ type: 'date', nullable: true })
  dewormingDate: Date = new Date()

  @Column({ type: 'date', nullable: true })
  reminderDate: Date = new Date()
}