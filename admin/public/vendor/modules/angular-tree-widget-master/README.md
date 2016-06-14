Agular Tree Widget
================

Light [AngularJS](http://www.angularjs.org) tree widget control, without jQuery dependency.

![ScreenShot](https://github.com/AlexSuleap/angular-tree-widget/blob/master/demo/img/demo.png)

## Features

- Reacts at model changes.
- Isolated scope.
- Easy customizable using css.
- Custom icons[or no icons at all].
- Multiple selection.
- Disabled nodes.

## Demo

Watch the tree in action on the [demo page](http://alexsuleap.github.io/).

## Installation

[Download](/AlexSuleap/angular-tree-widget/archive/master.zip) the project.

Load the style and the script in your project:

```html
<script type="text/javascript" src="/angular-tree-widget.min.js"></script>
<link rel="stylesheet" type="text/css" href="/angular-tree-widget.min.css">
```

Add a dependency to your application module.

```javascript
angular.module('myApp', ['TreeWidget']);
```

Add data for the tree
```javascript	
$scope.treeNodes =[{
	name: "Node 1",
        children: [{
            name: "Node 1.1",
            children:[
				{name:"Node 1.1.1"},
				{name: "Node 1.1.2"}]
        }]
	},{
        name: "Node 2",
        children: [
			{name: "Node 2.1"},
			{name: "Node 2.2"}
		]
    }];
```

Add the tree tag to your application.
```html
<tree nodes='treeNodes'>
```

Do not forget to add [AngularJS](http://www.angularjs.org), [AngularJS.Animate](http://www.angularjs.org) and [Angular Recursion](https://github.com/marklagendijk/angular-recursion) references to your project.

## Usage

- set the `image` property if you want to use a custom image.
- set the ` disabled` property on `true` if you want to disable the node selection.
- set the ` expanded` property on `false` if you want the node to be collapsed.
- updating the tree is done by updating the model.
- `options` - add the options attribute to the tree tag ```html<tree nodes='treeNodes' options='options'>```:
	- `multipleSelect` on `true`: allows the user to select multiple nodes; default value `false`.
	- `showIcon` on `false`: allows the user to hide the icons; default value `true`; If no images are provided the tree uses the default icons.
	- `expandOnClick` on `true`: allow the user the expand/collapse a node by clicking on it's label.
- events:
	- 'selection-changed': triggered when a node gets selected;
	- 'expanded-state-changed':  triggered whenever a node expand state changes.

## License

The MIT License.

Copyright ⓒ 2016 Alex Suleap

See [LICENSE](https://github.com/AlexSuleap/angular-tree-widget/blob/master/LICENSE)