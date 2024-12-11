import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, BelongsToMany, DataType } from 'sequelize-typescript';

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



  @ForeignKey(() => Stream)
  @Column
  streamId: string;

  @BelongsTo(() => Stream, {onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  stream: Stream;



  @Column
  type: ActionType;



  @Column( DataType.JSON )
  data: object;
}