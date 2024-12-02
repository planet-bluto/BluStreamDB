import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import Spark from "./Spark"
import Stream from './Stream';

@Table
export default class SparkStream extends Model {
  @ForeignKey(() => Spark)
  @Column
  sparkId: string;

  @ForeignKey(() => Stream)
  @Column
  streamId: string;
}