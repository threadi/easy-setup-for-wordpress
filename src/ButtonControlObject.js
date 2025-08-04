/**
 * Import dependencies.
 */
import { Component } from '@wordpress/element';
import { Button } from '@wordpress/components';

/**
 * Declare our custom ButtonControlObject-object
 */
export default class ButtonControlObject extends Component {
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
     * Set the button class for its styling.
     *
     * @type {string}
     */
    let variant = 'primary';
    if( this.props.field.variant ) {
      variant = this.props.field.variant;
    }

    /**
     * Output resulting Button.
     */
    return <div className="easy-setup-for-wordpress-button-component">
      <Button variant={variant} onClick={eval(this.props.field.onclick)}>{this.props.field.label}</Button>
      <p>{helper_text}</p>
    </div>
  }
}
