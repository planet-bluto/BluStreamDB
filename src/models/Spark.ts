import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany } from 'sequelize-typescript';

import { ChargeType } from '../types/charge_type';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

import Chatter from "./Chatter"
import Charge from "./Charge"
import Stream from './Stream';
import SparkStream from './SparkStream';

@Table
export default class Spark extends Model {
  @Column({ primaryKey: true })
  id: string = String(snowflake.generate());



  @ForeignKey(() => Chatter)
  @Column
  chatterId: string;

  @BelongsTo(() => Chatter)
  chatter: Chatter;



  @HasMany(() => Charge)
  charges: Charge[];


  
  @BelongsToMany(() => Stream, () => SparkStream)
  streams: Stream[];



  async totalCharge(type?: ChargeType): Promise<number> {
    let total = 0;

    let charges = await this.$get("charges")

    charges?.forEach(charge => {
      total += (type == null || type == charge.type ? charge.amount : 0)
    })

    return total
  }

  async toCleanJSON() {
    await this.reload({include: [Charge, Stream]})
    let jsonObj = this.toJSON()
    jsonObj["totalCharge"] = await this.totalCharge()
    return jsonObj
  }
}