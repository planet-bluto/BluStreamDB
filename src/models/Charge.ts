import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany } from 'sequelize-typescript';

import { ChargeType } from '../types/charge_type';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

import Spark from './Spark';

import Stream from './Stream';
import ChargeStream from './ChargeStream';

@Table
export default class Charge extends Model {
  @Column({ primaryKey: true })
  id: string = String(snowflake.generate());



  @ForeignKey(() => Spark)
  @Column
  sparkId: string;

  @BelongsTo(() => Spark)
  spark: Spark;



  @BelongsToMany(() => Stream, () => ChargeStream)
  streams: Stream[];
  


  @Column
  type: ChargeType;

  @Column
  amount: number;
}