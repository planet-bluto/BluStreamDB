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



  @BelongsToMany(() => Chatter, () => ChatterStream)
  active_chatters: Chatter[];



  @BelongsToMany(() => Action, () => ActionStream)
  activity: Action[];


  
  @BelongsToMany(() => Spark, () => SparkStream)
  sparks: Spark[];



  @BelongsToMany(() => Charge, () => ChargeStream)
  charges: Array<Charge & {ChargeStream: ChargeStream}>;
  // charges: Charge[];
}