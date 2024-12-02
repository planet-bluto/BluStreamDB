import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import Chatter from "./Chatter"
import Stream from './Stream';

@Table
export default class ChatterStream extends Model {
  @ForeignKey(() => Chatter)
  @Column
  chatterId: string;

  @ForeignKey(() => Stream)
  @Column
  streamId: string;
}