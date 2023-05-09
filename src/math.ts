export class Matrix {
    //变换矩阵，最后一行固定为0,0,1
    // [a, c, tx]
    // [b, d, ty]
    // [0, 0, 1 ]
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    tx = 0;
    ty = 0;

    //构造函数
    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }
    //更新矩阵(矩阵相乘)
    updateFromTransformProperties(x: number, y: number, scaleX: number, scaleY: number, rotation: number) {
        this.tx = x;
        this.ty = y;

        let skewX, skewY;
        skewX = skewY = (rotation * Math.PI) / 180;

        this.a = Math.cos(skewY) * scaleX;  //cos(skewY) = cos(rotation)
        this.b = Math.sin(skewY) * scaleX;  //sin(skewY) = sin(rotation)
        this.c = -Math.sin(skewX) * scaleY; //sin(skewX) = -sin(rotation)
        this.d = Math.cos(skewX) * scaleY;  //cos(skewX) = cos(rotation)
    }

}

export type Point = {
    x: number;
    y: number;
}

export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
}

//m2 * m1
export function matrixAppendMatrix(m1: Matrix, m2: Matrix) {
    const result = new Matrix();
    result.a = m1.a * m2.a + m1.b * m2.c;
    result.b = m1.a * m2.b + m1.b * m2.d;
    result.c = m1.c * m2.a + m1.d * m2.c;
    result.d = m1.c * m2.b + m1.d * m2.d;
    result.tx = m1.tx * m2.a + m1.ty * m2.c + m2.tx;
    result.ty = m1.tx * m2.b + m1.ty * m2.d + m2.ty;

    return result;
}

//伴随矩阵法求逆矩阵
export function matrixInvert(m: Matrix) {
    const result = new Matrix();
    const a = m.a;
    const b = m.b;
    const c = m.c;
    const d = m.d;
    const tx = m.tx;
    const ty = m.ty;

    const n = a * d - b * c;

    result.a = d / n;
    result.b = -b / n;
    result.c = -c / n;
    result.d = a / n;
    result.tx = (c * ty - d * tx) / n;
    result.ty = -(a * ty - b * tx) / n;

    return result;
}

//m * p（对向量进行变换）
export function pointAppendMatrix(p: Point, m: Matrix) {
    const result: Point = { x: 0, y: 0 };
    result.x = p.x * m.a + p.y * m.c + m.tx;
    result.y = p.x * m.b + p.y * m.d + m.ty;

    return result;
}

//鼠标点击判断
export function isPointInRectangle(point: Point, rect: Rectangle) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}