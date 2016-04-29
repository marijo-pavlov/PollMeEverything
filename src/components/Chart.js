import React from 'react';
import ReactFauxDOM from 'react-faux-dom';
import d3 from 'd3';

var Chart = React.createClass({
	getInitialState(){
		return {
			colorTooltip: null,
			showTooltip: null,
			textTooltip: null
		};
	},
	showTooltip(colorFunction, d, i){
		this.setState({
			colorTooltip: colorFunction(i),
			showTooltip: true,
			textTooltip: String(d.data.votes)
		});
	},
	hideTooltip(d, i){
		this.setState({
			colorTooltip: null,
			showTooltip: null,
			textTooltip: null
		});
	},
	componentDidMount(){
		var self = this;
        window.addEventListener("resize", function(){
        	self.setState({ });
        });
	},
	render(){
		var data = this.props.data;

		var container = document.getElementById('chartContainer');

		if(container){
			var dimensions = container.getBoundingClientRect();

			var width = dimensions.width,
				height = width*0.8,
				radius = Math.min(width, height)/2;

			var color = d3.scale.category10();

			var arc = d3.svg.arc()
				.innerRadius(radius - width*0.225)
				.outerRadius(radius*0.7);

			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d){
					return d.votes;
				});

			var node = ReactFauxDOM.createElement('svg');

			var svg = d3.select(node)
				.attr('width', width)
				.attr('height', height)
				.append('g')
	    		.attr("transform", "translate(" + width/2 + "," + (height/2 - width*0.225/2) + ")");	

	    	var tooltip = svg.append('text')
				.text(this.state.textTooltip)
				.attr('text-anchor', 'middle')
				.attr('dy', '0.25em')
				.style('fontSize', '6em')
				.style('fill', this.state.colorTooltip)
				.style('display', this.state.showTooltip);

	    	var answers = svg.selectAll('.arc')
	    		.data(pie(data.choices))
	    		.enter()
	    		.append('g')
	    		.attr('class', 'arc');

	    	answers.append('path')
	    		.attr('d', arc)
	    		.style('fill', function(d, i){
	    			return color(i)
	    		})
	    		.on('mouseover', this.showTooltip.bind(null, color))
	    		.on('mouseout', this.hideTooltip);

			var legend = svg.selectAll('.legend')
				.data(pie(data.choices))
				.enter()
				.append('g')
	    		.attr("transform", "translate(-" + (width / 2) + ",-" + (height / 2 - width*0.225/2 - height*0.05) + ")")	
				.attr('class', 'legend');

			legend.append('rect')
				.attr('width', width*0.02)
				.attr('height', width*0.02)
				.style('fill', function(d, i){
					return color(i);
				})
				.attr('transform', function(d, i){
					return 'translate(0, ' + i*height*0.05 + ")";
				})
	    		.on('mouseover', this.showTooltip.bind(null, color))
	    		.on('mouseout', this.hideTooltip);

			legend.append('text')
	         	.attr('x', width*0.025)
	          	.attr('y', width*0.018)
	          	.attr('fontWeight', 'bold')
	          	.attr('fontSize', '1.2em')
				.text(function(d){
					return d.data.choiceText;
				})
				.style('fill', function(d, i){
					return color(i);
				})
				.attr('transform', function(d, i){
					return 'translate(0, ' + i*height*0.05 + ")";
				})
	    		.on('mouseover', this.showTooltip.bind(null, color))
	    		.on('mouseout', this.hideTooltip);

	    	return node.toReact();
	    	}else{
	    		return null
	    	}

    	}
});

module.exports = Chart;