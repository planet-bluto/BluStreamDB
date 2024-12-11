import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany } from 'sequelize-typescript';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

import Chatter from "./Chatter"
import Charge from "./Charge"
import Spark from './Spark';
import Action from './Action';

import ChatterStream from './ChatterStream';
import ActionStream from './ActionStream';
import ChargeStream from './ChargeStream';
import SparkStream from './SparkStream';

@Table
export default class Stream extends Model {
  @Column({ primaryKey: true })
  id: string = String(snowflake.generate());



  @BelongsToMany(() => Chatter, {through: (() => ChatterStream), onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  active_chatters: Chatter[];


  
  @BelongsToMany(() => Spark, {through: () => SparkStream, onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  sparks: Spark[];



  @HasMany(() => Charge, "streamId")
  charges: Charge[];


  @HasMany(() => Action, "streamId")
  activity: Action[];
}