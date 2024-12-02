import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import Action from "./Action"
import Stream from './Stream';

@Table
export default class ActionStream extends Model {
  @ForeignKey(() => Action)
  @Column
  actionId: string;

  @ForeignKey(() => Stream)
  @Column
  streamId: string;
}