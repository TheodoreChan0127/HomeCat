import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { PetStatus } from './PetStatus';

@Entity()
export class Pregnant {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => PetStatus, petStatus => petStatus.pregnancies)
  @JoinColumn()
  petStatus: PetStatus = undefined as any;

  @Column({ type: 'date', nullable: true })
  matingDate: Date = new Date()

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date = new Date()

  @Column({ type: 'date', nullable: true })
  reminder7Days: Date | null = null

  @Column({ type: 'date', nullable: true })
  reminder3Days: Date | null = null

  @Column({ type: 'date', nullable: true })
  reminder1Day: Date | null = null

  @Column({ type: 'boolean', default: false })
  isDelivered: boolean = false

  @Column({ type: 'int', nullable: true })
  deliveryCount: number | null = null

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string = ''
}