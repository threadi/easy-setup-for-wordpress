/**
 * Import dependencies.
 */
import { Component } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';

/**
 * Declare our custom SelectControl-object
 */
export default class TableObject extends Component {
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
         * Get classes for SelectControl depending on errors in the actual setup.
         *
         * @type {string}
         */
        let classes = "";
        if( this.props.object.state.results[this.props.field_name] ) {
            if ( this.props.object.state.results[this.props.field_name].result.error) {
                classes = 'easy-setup-for-wordpress-error';
                if (this.props.object.state.results[this.props.field_name].result.text) {
                    helper_text = <><span className="hint">{this.props.object.state.results[this.props.field_name].result.text}</span><span
                        dangerouslySetInnerHTML={{__html: this.props.field.help}}/></>;
                }
            }
            else if( this.props.object.state[this.props.field_name] && this.props.object.state[this.props.field_name].length > 0 ) {
                classes = 'easy-setup-for-wordpress-ok';
            }
        }

        /**
         * Output resulting Table object.
         */
        return (
            <table className="easy-setup-for-wordpress-table">
                <thead>
                <tr>
                    <th>{this.props.field.labels[0]}</th>
                    <th>{this.props.field.labels[1]}</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(this.props.object.state.loaded[this.props.field_name]).map( entry => {
                    return (<tr key={entry}>
                        <td>{this.props.object.state.loaded[this.props.field_name][entry].label}</td>
                        <td>
                            {
                                <SelectControl
                                    onChange={(value) => onChangeValue( this.props.object, this.props.field_name, entry, value )}
                                    options={this.props.object.state.loaded[this.props.field_name][entry].values}
                                />
                            }
                        </td>
                    </tr>)
                })}
                </tbody>
            </table>
        )
    }
}

/**
 * Check value of single field. Mark the field with hints if some error occurred.
 *
 * Change the value of a single field no matter what the result is.
 *
 * @param object
 * @param field_name
 * @param entry
 * @param newValue
 */
export const onChangeValue = ( object, field_name, entry, newValue ) => {
    object.state[field_name] = [...object.state[field_name], {entry: entry, value: newValue}]
}
