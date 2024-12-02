import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import Charge from "./Charge"
import Stream from './Stream';

@Table
export default class ChargeStream extends Model {
  @ForeignKey(() => Charge)
  @Column
  chargeId: string;

  @ForeignKey(() => Stream)
  @Column
  streamId: string;
}