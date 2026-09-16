/**
 * Import dependencies.
 */
import { Component } from '@wordpress/element';
import newId from './helper/getid';
import {showError} from "./setup";

/**
 * Check the state of the progress.
 */
function getProcessInfo( object ) {
  setTimeout(() => {
    object.props.object.setState( { 'button_disabled': true });

    fetch( easy_setup_for_wordpress.process_info_url, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-WP-Nonce': easy_setup_for_wordpress.rest_nonce
      },
      body: JSON.stringify({
        'config_name': object.props.object.props.config.name,
      })
    } )
        .then( response => response.json() )
        .then( function (result) {
          if( result.step > 0 && result.max > 0 ) {
            // set progress.
            document.getElementById( object.progressbar_id ).value = ((result.step / result.max) * 100);
          }

          // set label.
          document.getElementById( object.label_id ).innerHTML = result.step_label;

          // run info-check again if progress is running.
          if( 1 === result.running ) {
            getProcessInfo( object );
          }
          else {
            // enable finish button.
            object.props.object.setState( { 'finish_button_disabled': false });
          }
        })
        .catch( error => showError( error ) )
  }, 500)
}

/**
 * Declare our custom ProgressBar-object
 */
export default class ProgressBarObject extends Component {
  constructor() {
    super( ...arguments );
    this.progressbar_id = newId();
    this.label_id = newId();
  }

  /**
   * Start processing the setup.
   */
  componentDidMount() {
    const save_promise = this.props.object.state.save_promise || Promise.resolve();

    // wait until the settings have been saved, the process needs them.
    save_promise.then( () => {
      fetch( easy_setup_for_wordpress.process_url, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'X-WP-Nonce': easy_setup_for_wordpress.rest_nonce
        },
        body: JSON.stringify( { config_name: this.props.object.props.config.name } )
      } ).catch( e => showError( e ) );

      getProcessInfo( this );
    } ).catch( e => showError( e ) );
  }

  /**
   * Render the output.
   *
   * @returns {JSX.Element}
   */
  render() {
    return <div
        className="easy-setup-for-wordpress-progressbar components-base-control__field"
    >
      <label>{this.props.field.label}</label>
      <progress id={this.progressbar_id} max="100" value="0">&nbsp;</progress>
      <p id={this.label_id}></p>
    </div>
  }
};
