import {onChangeField} from "./setup";

/**
 * Import dependencies.
 */
import { Component } from '@wordpress/element';
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';

/**
 * Declare our custom NumberControl-object
 */
export default class NumberControlObject extends Component {
	constructor() {
		super( ...arguments );
	}

	/**
	 * Render the output.
	 *
	 * @returns {JSX.Element}
	 */
	render() {
		/**
		 * Create helper text.
		 *
		 * @type {JSX.Element}
		 */
		let helper_text = <span dangerouslySetInnerHTML={{__html: this.props.field.help}}/>

		/**
		 * Get classes for NumberControl depending on errors in actual setup.
		 *
		 * @type {string}
		 */
		let classes = "";
		if( this.props.object.state.results[this.props.field_name] ) {
			if ( this.props.object.state.results[this.props.field_name].result.error ) {
				classes = 'easy-setup-for-wordpress-error';
				if ( this.props.object.state.results[this.props.field_name].result.text ) {
					helper_text = <><span className="hint">{this.props.object.state.results[this.props.field_name].result.text}</span><span
						dangerouslySetInnerHTML={{__html: this.props.field.help}}/></>;
				}
			}
			else if( this.props.object.state[this.props.field_name] && this.props.object.state[this.props.field_name].length > 0 ) {
				classes = 'easy-setup-for-wordpress-ok';
				this.props.object.state.results[this.props.field_name].filled = true;
			}
		}

		/**
		 * Output resulting NumberControl.
		 */
		return <NumberControl
			__next40pxDefaultSize
			label={this.props.field.label}
			className={classes}
			help={helper_text}
			onChange={(value) => onChangeField( this.props.object, this.props.field_name, this.props.field, value )}
			shiftStep={ this.props.field.step }
			min={ this.props.field.min }
			max={ this.props.field.max }
			value={this.props.object.state[this.props.field_name]}
		/>
	}
}
