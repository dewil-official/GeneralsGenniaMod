import Point from './point';
import Player from './player';
import GameMap from './map';

export { Point, Player, GameMap };

export interface Position {
  x: number;
  y: number;
}

export type LeaderBoardData = {
  color: number;
  username: string;
  armyCount: number;
  landsCount: number;
}[];

export interface UserData {
  name: string;
  color: number;
}

export class Message {
  constructor(
    public player: Player,
    public content: string
  ) {}
}

export class Room {
  constructor(
    public id: string,
    public roomName: string = 'Untitled',
    public gameStarted: boolean = false,
    public forceStartNum: number = 0,
    public mapGenerated: boolean = false,
    public maxPlayers: number = 8,
    public gameSpeed: number = 1, // valid value: [0.25, 0.5, 0.75, 1, 2, 3, 4];
    public mapWidth: number = 0.75,
    public mapHeight: number = 0.75,
    public mountain: number = 0.5,
    public city: number = 0.5,
    public swamp: number = 0,
    public fogOfWar: boolean = true,

    public map: GameMap | null = null,
    public gameLoop: any = null, // gameLoop function
    public players: Player[] = new Array<Player>(),
    public generals: Point[] = new Array<Point>()
  ) {}

  toJSON() {
    const { map, gameLoop, generals, ...json } = this;
    return json;
  }
}

export type RoomPool = { [key: string]: Room };

export enum TileType {
  King = 0, // base
  City = 1, // spawner
  Fog = 2, // it's color unit = null
  Obstacle = 3, // Either City or Mountain, which is unknown, it's color unit = null
  Plain = 4, // blank , plain, Neutral, 有数值时，即是army
  Mountain = 5,
  Swamp = 6,
}

// TileType
// color: when color == null 表示什么？ todo
// unitsCount: number
export type TileProp = [TileType, number | null, number | null];

export type TilesProp = TileProp[];

export type MapDataProp = TilesProp[];

export const TileType2Image: Record<TileType, string> = {
  [TileType.King]: '/img/king.png',
  [TileType.City]: '/img/city.png',
  [TileType.Fog]: '',
  [TileType.Obstacle]: '/img/mountain.png',
  [TileType.Plain]: '',
  [TileType.Mountain]: '/img/mountain.png',
  [TileType.Swamp]: '/img/swamp.png',
};
