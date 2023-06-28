import { Behaviour, SerializedNumber, Transform } from "../engine/engine";
import { featureType, Grid } from "../gameConcepts";

export class WorldBehaviour extends Behaviour {
    //声明一个50*50的Grid数组
    grids = new Array<Grid[]>();

    isClick = false;
    onStart(): void {
        //将grids随机赋值为50*50的二维数组
        for (let i = 0; i < 50; i++) {
            this.grids[i] = [];
            for (let j = 0; j < 50; j++) {
                if (Math.random() > 0.5) {
                    //是海洋
                    this.grids[i][j] = new Grid(true, [], []);
                }
                else {
                    //是陆地
                    this.grids[i][j] = new Grid(false, [], []);

                    //赋予地块随机地貌特征
                    let random = Math.random();
                    if (random < 0.2) {
                        this.grids[i][j].features.push(featureType.grassland);
                    }
                    else if (random < 0.4) {
                        this.grids[i][j].features.push(featureType.forest);
                    }
                    else if (random < 0.6) {
                        this.grids[i][j].features.push(featureType.swamp);
                    }
                    else if (random < 0.8) {
                        this.grids[i][j].features.push(featureType.hill);
                    }
                    else {
                        this.grids[i][j].features.push(featureType.mountain);
                    }
                }
            }
        }

        //将grids中的每个地块的地形以0和1的形式打印出来
        const gridsArray = new Array<number[]>();
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (this.grids[i][j].isSea) {
                    gridsArray.push([0]);
                }
                else {
                    gridsArray.push([1]);
                }
            }
        }
        console.log(gridsArray);

        this.gameObject.onClick = () => {
            console.log("Clickable");
            this.isClick = true;

        };
    }
    onUpdate() {
        if (this.isClick) {
            const transform = this.gameObject.getBehaviour(Transform);
        }
    }
}