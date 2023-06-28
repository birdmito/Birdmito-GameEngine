import { Behaviour, BitmapRenderer, imageCache, SerializedNumber, Transform } from "../engine/engine";

//写完Behavior后，记得在src\main.ts中注册
export class CanvasBehaviour extends Behaviour {
    transform: Transform = new Transform();

    //声明一个三维数组存储9张图片的分辨率（宽高）
    imageResolution = new Array<Array<number>>();

    onStart(): void {
        //获取当前物体的Transform组件
        this.transform = this.gameObject.getBehaviour(Transform);

        console.log(this.gameObject);
        console.log(this.gameObject.children);
        //获取子物体中的第1-9个并获取它们的BitmapRenderer组件
        for (let i = 0; i < 9; i++) {
            const child = this.gameObject.parent;
            if (child) {
                // console.log(child);
                // console.log(this.gameObject.children[i].getBehaviour(BitmapRenderer));
                // const image = imageCache.get(this.gameObject.children[i].getBehaviour(BitmapRenderer).image);
                // //将图片分辨率存入imageResolution数组
                // this.imageResolution.push([image.width, image.height]);
            }

            // //根据本物体的Transform以九宫格的形式依次修改每个子物体的位置
            // this.gameObject.children[0].getBehaviour(Transform).x = this.transform.x - this.imageResolution[0][0] / 2;
            // this.gameObject.children[0].getBehaviour(Transform).y = this.transform.y - this.imageResolution[0][1] / 2;
            // this.gameObject.children[1].getBehaviour(Transform).x = this.transform.x;
            // this.gameObject.children[1].getBehaviour(Transform).y = this.transform.y - this.imageResolution[1][1] / 2;
            // this.gameObject.children[2].getBehaviour(Transform).x = this.transform.x + this.imageResolution[2][0] / 2;
            // this.gameObject.children[2].getBehaviour(Transform).y = this.transform.y - this.imageResolution[2][1] / 2;
            // this.gameObject.children[3].getBehaviour(Transform).x = this.transform.x - this.imageResolution[3][0] / 2;
            // this.gameObject.children[3].getBehaviour(Transform).y = this.transform.y;
            // this.gameObject.children[4].getBehaviour(Transform).x = this.transform.x;
            // this.gameObject.children[4].getBehaviour(Transform).y = this.transform.y;
            // this.gameObject.children[5].getBehaviour(Transform).x = this.transform.x + this.imageResolution[5][0] / 2;
            // this.gameObject.children[5].getBehaviour(Transform).y = this.transform.y;
            // this.gameObject.children[6].getBehaviour(Transform).x = this.transform.x - this.imageResolution[6][0] / 2;
            // this.gameObject.children[6].getBehaviour(Transform).y = this.transform.y + this.imageResolution[6][1] / 2;
            // this.gameObject.children[7].getBehaviour(Transform).x = this.transform.x;
            // this.gameObject.children[7].getBehaviour(Transform).y = this.transform.y + this.imageResolution[7][1] / 2;
            // this.gameObject.children[8].getBehaviour(Transform).x = this.transform.x + this.imageResolution[8][0] / 2;
            // this.gameObject.children[8].getBehaviour(Transform).y = this.transform.y + this.imageResolution[8][1] / 2;
        }
    }
}