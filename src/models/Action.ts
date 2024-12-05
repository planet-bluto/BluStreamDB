import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, BelongsToMany } from 'sequelize-typescript';

import Chatter from './Chatter';
import Stream from './Stream';
import { ActionType } from '../types/action_type';
import ActionStream from './ActionStream';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

@Table
export default class Action extends Model {
  @Column({ primaryKey: true })
  id: string = String(snowflake.generate())



  @ForeignKey(() => Chatter)
  @Column
  chatterId: string;



  @BelongsTo(() => Chatter, {onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  chatter: Chatter;



  @BelongsToMany(() => Stream, {through: () => ActionStream, onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  streams: Stream[];



  @Column
  type: ActionType;



  @Column
  data: string;
}