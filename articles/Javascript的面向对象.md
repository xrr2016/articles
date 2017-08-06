# Javascript 与面向对象

## 前言

## 面对对象编程

面向对象编程 (OOP) 是对真实世界抽象建模的一种编程方式，可以认为在程序中包含各种独立而又能够相互调用的对象的思想。

## 类与对象

类相当于一张蓝图，它定义了对象的属性与方法，包含数据的形式以及对数据的处理。而对象则是类的实例化，它拥有属性与方法，能够能够接受数据，处理数据，将数据传达给其它对象。

![类](../imgs/class.jpg)
![对象](../imgs/object.jpg)

## Javascript 中没有 '类'

与传统的面对对象编程语言不同的是，在 ES6 之前的相当长的一段时间内 Javascript 没有类的声明语句（现在 ES6 新增了 class 关键字）只有一些近似类的语法元素如 new 和 instanceof，但是可以通过一些方法近似实现类的功能。

由于 javascript 的作者在创造这门编程语言的时候参考了 Self 和 Smalltalk 这两门语言特性，所以在 Javascript 中没有 ‘类’ 这一概念，这是 Javascript 的特色之一。

## 构造函数

要在 Javascript 中创建一个类的实例化对象，需要调用一个跟类同名的函数， 即构造函数。

## 封装

封装最大的好处是保护数据以及实现，将他们隐藏起来。许多语言提供了 private, public, proteced 等关键字来提供不同的访问权限, 在 Javascript 中并没有提供, 不过依赖变量的作用域可以实现对 public, private 这两种特性的模拟. 通过创建函数作用域来隐藏想要保护的数据.

```js
  var myBasketball = (function () {
    var price = 100 // 私有变量 (private)
    return {
      getPrice: function () {
        return price
      },
      setPrice: function (value) {
        price = value
      }
    }
  })()
```

## 基于原型的继承

目前在 Javascript 中构造一个类最流行的方式是结合构造函数模式和原型模式
要在 Javascript 中实现类的继承，需要做的是把子类的原型对象 prototype 指向父类的一个实例，基于原型链的关联机制是实现继承的本质。

```js
var Father = function () {}
var Child = function () {}
Child.prototype = new Farther()
// ES6
class Father {}
class Child extends Father {
  constructor () {
    super()
  }
}
```

这样子类就得到了父类全部的属性和方法

## 多态

多态的实际含义是: 同一操作作用在不同的对象上，可以产生不同的解释和不同的执行结果。 给不同的对象发送同一个消息时，这些对象会根据这个消息给出不同的反馈.
多态指的是同一个操作可能在不同的对象上得到不一样的结果

```js
var working = function (person) {
  person.work()
}

var Teacher = function () {}
Teacher.prototype.work = function () {
  console.log('Teach student.')
}

var Doctor = function () {}
Doctor.prototype.work = function () {
  console.log('cure the sickness')
}

var kevin = new Teacher()
var martin = new Doctor()

working(kevin)
working(martin)

```

## 例子

最后用一个例子来说明以上的概念

## 参考资料

written by [轻键快码](https://www.github.com/xrr2016) 2017/8/6


