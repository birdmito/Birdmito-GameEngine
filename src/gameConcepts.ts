export enum buildingType {
    money,
    scence,
    army,
}

//地貌特征
export enum featureType {
    //草原
    grassland,
    //森林
    forest,
    //沼泽
    swamp,
    //丘陵
    hill,
    //山地
    mountain,
    //沙漠
    desert,
}


export class Buiding {
    constructor(type: buildingType, level: number, x: number, y: number) {
        this.type = type;
        this.level = level;
        this.x = x;
        this.y = y;
    }

    type: buildingType;
    cost = 1;
    level = 1;
    levelUpCost = 1 * this.level;
    x: number;
    y: number;
}

export class Grid {
    //地块类
    constructor(isSea: boolean, buildings: Buiding[], features: featureType[]) {
        this.isSea = isSea;
        this.buildings = buildings;
        this.features = features;
    }

    //地形
    isSea: boolean; //0表示水，1表示陆地
    //地块上的建筑
    buildings: Buiding[];
    //地貌特征
    features: featureType[];
    //单位到达所需AP
    APCosted: number = 1;
    //产出金币数
    money: number = 1;
}