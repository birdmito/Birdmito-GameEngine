<<<<<<< HEAD
# Birdmito GameEngine

#### 介绍
丁禹斯的游戏引擎分析练习实践

#### 更新日志
##### 2022.11.05
学习了第七周代码内容  
1. 将开发语言转换为TypeScript  
2. 引入了vite  
3. 通过localMatrix和globalMatrix的矩阵乘法实现了局部坐标系和全局坐标系转换  
4. 引入Container，通过多叉树的结构组织GameObject的层级关系  
5. 在render时通过遍历多叉树实现了GameObject的渲染  
6. 将点击事件的反向遍历重构为多叉树的遍历方法，并通过局部坐标系的转换修正了点击事件的范围  
8. 点击事件的捕获冒泡机制  
9. 实现了通过git提交代码  
10. README文件  
##### 2022.11.14
学习了第八周代码内容  
1. 将引擎从Flash-like架构转换为Unity-like架构  
2. 通过桥梁模式采取组合优先的方式实现了GameObject的游戏逻辑Behaviour组件化  
3. 新建exampleBehaviour,在'游戏场景内容'中通过调用物体的addBehaviour添加新的Behaviour组件  
4. 实现了MoveWhenClickBehaviour，通过点击物体实现物体的移动  
5. 实现了RotateBehaviour，实现物体的旋转  
##### 2022.11.15
学习了第九周代码内容  
1. 将引擎逻辑从main.ts中分离出来，新建engine.ts，将引擎的初始化和游戏逻辑的初始化分离  
2. gameEngine不再提供回调函数onUpdate写游戏逻辑，而是通过Behaviour类的update来实现游戏逻辑  
3. 将Behaviour类的run方法重构到GameObject类的addBehaviour方法中  
4. 将所有游戏逻辑都放到了Behaviour中实现  
5. 进行微内核改造，将引擎结构方式重构为游戏结构方式（Behaviour）  
   ·GameObject的变换由Transform实现  
   ·GameObject的渲染由Renderer实现  
   ·Renderer的getBounds采用多态的方式实现  
6. 由于draw已经在组件的onUpdate中实现，将GameObject的draw方法重构为onUpdate  
##### 2022.11.19
学习了第十周代码内容
1. 将游戏数据(data/behaviour)从游戏逻辑中分离出来，新建data.ts，供游戏策划使用  
2. 在engine.ts中新增createGameObject方法，通过传入游戏数据来创建游戏物体  
3. 通过registerBehaviour方法将data.ts的type映射成Behaviour类  
4. 通过重构后，main.ts中的代码量大大减少，不再需要手动实例化behavior只需要调用createGameObject方法即可创建游戏物体 
5. data.ts采用树形结构，在engine.ts通过递归的方式实现了多叉树的创建  
6. 引入js-yaml库，通过yaml文件来存储并创建游戏物体，并将逻辑重构到GameEngine中成为引擎逻辑  
7. 将各behavior从main.ts中分离成为单独的文件管理，每添加一个新的behavior都需要在main.ts中注册  
8. 序列化（存储为yaml文件）和反序列化（读取yaml文件）  
##### 2022.12.12
学习了第十一周代码内容
1. 实现所见即所得编辑器第一步：序列化和反序列化  
2. 反序列化：text文本通过yaml.parse方法转化为json，再通过createGameObject方法创建游戏物体gameObject  
3. 序列化：GameObject通过extractGameObject方法转化为json，再通过yaml.dump方法转化为text文本  
4. 通过修饰符@SerializeField来标记需要序列化的属性  
#### 使用说明
##### 依赖
1. node.js  
2. npm  
3. vite  
4. typescript  
5. TSC  
6. js-yaml(npm install js-yaml,npm install @types/js-yaml)  

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
=======
