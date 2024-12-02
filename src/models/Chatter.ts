import { Table, Column, Model, HasMany, BelongsToMany } from 'sequelize-typescript';
import Spark from "./Spark";
import Action from "./Action";
import Stream from './Stream';
import ChatterStream from './ChatterStream';


@Table
export default class Chatter extends Model {
  @Column({ primaryKey: true })
  id: string;
  
  

  @HasMany(() => Spark, "chatterId")
  sparks: Spark[];



  @BelongsToMany(() => Stream, () => ChatterStream)
  streams: Stream[];


  
  @HasMany(() => Action, "chatterId")
  activity: Action[];
}