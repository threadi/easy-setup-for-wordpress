import {onChangeField} from "./setup";

/**
 * Import dependencies.
 */
import { Component } from '@wordpress/element';
import { BaseControl } from '@wordpress/components';

/**
 * Declare our custom CardControl-object.
 *
 * A RadioControl with one line per option is fine for a handful of short
 * words. This one is for choices the user should recognize at a glance:
 * every option is a card with an icon, a label and a description.
 *
 * Only the icon of an option is rendered as HTML, since it is an inline
 * SVG. Label and description stay text, so an option provided by a third
 * party cannot inject markup.
 */
export default class CardControlObject extends Component {
    constructor() {
        super( ...arguments );
    }

    /**
     * Render a single card.
     *
     * @param option The option to render.
     * @returns {JSX.Element}
     */
    renderCard( option ) {
        /**
         * Mark the card the user chose.
         *
         * @type {string}
         */
        let classes = "easy-setup-for-wordpress-card";

        if ( this.props.object.state[this.props.field_name] === option.value ) {
            classes += " is-selected";
        }

        /**
         * Show the icon only if the option brought one.
         *
         * @type {JSX.Element|null}
         */
        let icon = null;

        if ( option.icon ) {
            icon = <span className="easy-setup-for-wordpress-card__icon" dangerouslySetInnerHTML={{__html: option.icon}} aria-hidden="true" />;
        }

        /**
         * Show the description only if the option brought one.
         *
         * @type {JSX.Element|null}
         */
        let description = null;

        if ( option.description ) {
            description = <span className="easy-setup-for-wordpress-card__description">{ option.description }</span>;
        }

        return <button
            type="button"
            key={ option.value }
            className={ classes }
            aria-pressed={ this.props.object.state[this.props.field_name] === option.value }
            onClick={ () => onChangeField( this.props.object, this.props.field_name, this.props.field, option.value ) }
        >
            { icon }
            <label>{ option.label }</label>
            { description }
        </button>;
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
        let helper_text = this.props.field.help ? <span dangerouslySetInnerHTML={{__html: this.props.field.help}}/> : '';

        /**
         * Get classes for the list depending on errors in actual setup.
         *
         * @type {string}
         */
        let classes = "easy-setup-for-wordpress-cards";

        if( this.props.object.state.results[this.props.field_name] ) {
            if ( this.props.object.state.results[this.props.field_name].result.error) {
                classes += ' easy-setup-for-wordpress-error';
                if (this.props.object.state.results[this.props.field_name].result.text) {
                    helper_text = <><span className="hint">{this.props.object.state.results[this.props.field_name].result.text}</span><span
                        dangerouslySetInnerHTML={{__html: this.props.field.help}}/></>;
                }
            }
            else if( this.props.object.state[this.props.field_name] && this.props.object.state[this.props.field_name].length > 0 ) {
                classes += ' easy-setup-for-wordpress-ok';
            }
        }

        /**
         * Output the resulting cards.
         */
        return <BaseControl
            label={this.props.field.label}
            help={helper_text}
            __nextHasNoMarginBottom
        >
            <div className={classes}>
                { this.props.field.options.map( ( option ) => this.renderCard( option ) ) }
            </div>
        </BaseControl>
    }
}