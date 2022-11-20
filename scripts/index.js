const yaml = require('js-yaml');
const fs = require('fs');

const object = {
    behaviours: [],
    children: [
        {   //boss
            behaviours: [
                {
                    type: "Transform",
                    properties: {
                        x: 658,
                        y: 658,
                        rotation: 0,
                    },
                },
                {
                    type: "MoveWhenClickBehaviour",
                    properties: {
                        velocity: 1,
                    },
                },
                {
                    type: "TextRenderer",
                    properties: {
                        text: "boss",
                    },
                },
            ],
        },
        {   //mainRole
            behaviours: [
                {
                    type: "TextRenderer",
                    properties: {
                        text: "MainRole",
                    },
                },
                {
                    type: "MoveWhenClickBehaviour",
                    properties: {
                        velocity: 2,
                    },
                },
                {
                    type: "RotateBehaviour",
                    properties: {
                        velocity: 2,
                    },
                },
            ],
        },
        {   //building
            behaviours: [
                {
                    type: "Transform",
                    properties: {
                        x: 658,
                        y: 1000,
                        rotation: 0,
                    },
                },
                {
                    type: "TextRenderer",
                    properties: {
                        text: "Building",
                    },
                },
            ],
        },
        {   //loopBitmap
            behaviours: [
                {
                    type: "BitmapRenderer",
                    properties: {
                        image: "./images/meme.jpg",
                    }
                },
                {
                    type: "LoopMoveBehaviour",
                    properties: {
                        velocity: 2,
                    }
                },
            ],
        },
        {   //staticBitmap
            behaviours: [
                {
                    type: "Transform",
                    properties: {
                        x: 0,
                        y: 658,
                        rotation: 0,
                    },
                },
                {
                    type: "BitmapRenderer",
                    properties: {
                        image: "./images/meme.jpg",
                    }
                },
            ],
        },
    ],
}
//yaml序列化
//---------------------------------------------------------
const content = yaml.dump(object, {
    'styles': {
        '!!null': 'canonical' // dump null as ~
    },
    noCompatMode: true,     //不使用兼容模式,解决y序列化后变成'y'的问题
    //'sortKeys': true        // sort object keys
});

fs.writeFileSync("scene.yaml", content, "utf-8");