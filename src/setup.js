/**
 * File to handle the react-driven setup for this plugin.
 *
 * @source: https://wholesomecode.net/create-a-settings-page-using-wordpress-block-editor-gutenberg-components/
 */

// get individual styles.
import './setup.scss';

// get controls.
import RadioControlObject from './RadioControlObject';
import TextControlObject from './TextControlObject';
import ProgressBarObject from './ProgressBarObject';
import NumberControlObject from './NumberControlObject';
import CheckboxControlObject from './CheckboxControlObject';
import getActualDate from './helper/getActualDate';

// import dependencies.
import {
  Fragment,
  Component,
} from '@wordpress/element';
import api from '@wordpress/api';
import {
  Button,
  Panel,
  PanelBody,
} from '@wordpress/components';
import React from 'react'
import { render } from 'react-dom';

/**
 * Object which handles the setup.
 */
class EasySetupForWordPress extends Component {
  constructor() {
    super( ...arguments );
    this.state = {
      results: {}, // collection of field validation results.
      step: 1, // initially setup-step.
      button_disabled: true, // marker for continue-button-state.
      finish_button_disabled: true, // marker for finish-button-state.
      is_api_loaded: false, // marker if API has been loaded.
      fields: this.props.fields // the steps with its fields.
    };

    /**
     * Add our fields to the list with empty init value.
     */
    Object.keys(this.state.fields).map( step => {
      Object.keys(this.state.fields[step]).map( field_name => {
        this.state[field_name] = '';
      })
    });
  }

  /**
   * Get actual values for each setting.
   */
  componentDidMount() {
    api.loadPromise.then( () => {
      const { is_api_loaded } = this.state;
      if ( is_api_loaded === false ) {
        this.settings = new api.models.Settings();
        this.settings.fetch().then( ( response ) => {
          // collect settings for state, first mark the api as loaded.
          let state = {
            results: {},
            is_api_loaded: true,
          };

          // check if response contains one of our fields, add its value to state and mark it as filled via empty result-value.
          Object.keys(this.state.fields).map( step => {
            Object.keys( this.state.fields[step] ).map( field_name => {
              if (response[field_name] !== undefined) {
                state[field_name] = response[field_name];
                state.results[field_name] = {
                  'result': []
                }
              }
            } );
          });

          // set resulting state.
          this.setState(state);
        } );
      }
    } );
  }

  /**
   * Render the controls with its settings.
   *
   * @param field_name
   * @param field
   * @returns {JSX.Element|string}
   */
  renderControlSetting( field_name, field ) {
    switch(field.type) {
        /**
         * Show TextControl component for setting.
         */
      case 'TextControl':
        return <TextControlObject field_name={ field_name } field={ field } object={ this } />;

        /**
         * Show Checkbox component for setting.
         */
      case 'CheckboxControl':
        return <CheckboxControlObject field_name={ field_name } field={ field } object={ this } />;

        /**
         * Show RadioControl component for setting.
         */
      case 'RadioControl':
        return <RadioControlObject field_name={ field_name } field={ field } object={ this } />;

        /**
         * Show Progressbar component during running some server-side tasks.
         */
      case 'ProgressBar':
        return <ProgressBarObject field_name={ field_name } field={ field } object={ this } />

        /**
         * Show NumberControl component for setting.
         */
      case 'NumberControl':
        return <NumberControlObject field_name={ field_name } field={ field } object={ this } />;

        /**
         * Return empty string for all other types.
         */
      default:
        return <div dangerouslySetInnerHTML={{__html: field.text}} />
    }
  }

  /**
   * Generate output.
   *
   * @returns {JSX.Element}
   */
  render() {
    setButtonDisabledState( this );

    return (
        <Fragment>
          <div className="easy-setup-for-wordpress-header">
            <div className="easy-setup-for-wordpress-container">
              <div className="easy-setup-for-wordpress-title">
                <h1>{ this.props.config.title }</h1>
              </div>
            </div>
          </div>
          <div className="easy-setup-for-wordpress-main">
            <Panel>
              <PanelBody>
                {Object.keys(this.state.fields[this.state.step]).map( field_name => (
                    <div key={ field_name }>{this.renderControlSetting( field_name, this.state.fields[this.state.step][field_name] )}</div>
                ) )}
                {this.state.step === 1 && this.props.config.skip_url && <Button
                    isSecondary
                    onClick={() => location.href=this.props.config.skip_url }
                >
                  { <span dangerouslySetInnerHTML={{__html: this.props.config.skip_button_label}}/> }
                </Button>
                }
                {this.state.step > 1 && this.state.step !== Object.keys(this.state.fields).length && <Button
                    isSecondary
                    onClick={() => this.setState( { 'step': this.state.step - 1 } )}
                >
                  { <span dangerouslySetInnerHTML={{__html: this.props.config.back_button_label}}/> }
                </Button>
                }
                {this.state.step < Object.keys(this.state.fields).length && <Button
                    isPrimary
                    disabled={this.state.button_disabled}
                    onClick={() => onSaveSetup( this )}
                >
                  { <span dangerouslySetInnerHTML={{__html: this.props.config.continue_button_label}}/> }
                </Button>
                }
                {this.state.step === Object.keys(this.state.fields).length && <Button
                    isPrimary
                    disabled={this.state.finish_button_disabled}
                    onClick={() => onSetupCompleted( this ) }
                >
                  { <span dangerouslySetInnerHTML={{__html: this.props.config.finish_button_label}}/> }
                </Button>
                }
              </PanelBody>
            </Panel>
          </div>
        </Fragment>
    )
  }
}

/**
 * Load setup.
 */
document.addEventListener( 'DOMContentLoaded', () => {
  let html_obj = document.getElementById('easy-setup-for-wordpress');
  if( html_obj ) {
    if( ! html_obj.dataset.fields || ! html_obj.dataset.config ) {
      return;
    }
    if( ReactDOM.createRoot === undefined ) {
      render(<EasySetupForWordPress fields={JSON.parse( html_obj.dataset.fields )} config={JSON.parse( html_obj.dataset.config )}/>, html_obj);
    }
    else {
      ReactDOM.createRoot( html_obj ).render(
          <EasySetupForWordPress fields={JSON.parse( html_obj.dataset.fields )} config={JSON.parse( html_obj.dataset.config )}/>
      );
    }
  }
});

/**
 * Save the fields of the actual setup step via REST API.
 */
export const onSaveSetup = ( object ) => {
  // remove internal used parameter.
  let state = object.state;
  delete state.is_api_loaded;

  // save it via REST API for settings.
  new api.models.Settings( state ).save();

  // get actual setup config.
  if( object.props.config.update_fields ) {
    fetch(easy_setup_for_wordpress.get_fields + '/' + object.props.config.name, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-WP-Nonce': easy_setup_for_wordpress.rest_nonce
      }
    })
        .then(function(response) {
          if( response.ok ) {
            return response.json();
          }

          throw new Error(response.status);
        })
        .then(function (data) {
              object.setState({'fields': data, 'date': getActualDate()});
              // set next step for setup.
              object.setState({'step': object.state.step + 1});
            }
        )
        .catch(error => showError(error));
  }
  else {
    // set next step for setup.
    object.setState({'step': object.state.step + 1});
  }
}

/**
 * Mark setup as completed and forward user to given path from response, if set.
 */
export const onSetupCompleted = ( object ) => {
  fetch( easy_setup_for_wordpress.completed_url, {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'X-WP-Nonce': easy_setup_for_wordpress.rest_nonce,
    },
    body: JSON.stringify({
      'config_name': object.props.config.name,
    })
  } )
      .then( function(response) {
        if( response.ok ) {
          return response.json();
        }

        throw new Error(response.status);
      } )
      .then( function( result ) {
            if( result.forward ) {
              location.href = result.forward;
            }
          }
      )
      .catch( error => showError( error ) );
}

/**
 * Check value of single field. Mark field with hints if some error occurred.
 *
 * Change value of single field no matter what the result is.
 *
 * @param object
 * @param field
 * @param newValue
 * @param field_name
 */
export const onChangeField = ( object, field_name, field, newValue ) => {
  if( field.validation_callback ) {
    fetch( easy_setup_for_wordpress.validation_url, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-WP-Nonce': easy_setup_for_wordpress.rest_nonce
      },
      body: JSON.stringify({
        'config_name': object.props.config.name,
        'step': object.state.step,
        'field_name': field_name,
        'value': newValue
      })
    } )
        .then( function(response) {
          if( response.ok ) {
            return response.json();
          }

          throw new Error(response.status);
        } )
        .then( function( data ) {
              object.state.results[field_name] = data;
              object.setState( { 'date': getActualDate() } )
            }
        )
        .catch( error => showError( error ) );
  }
  else {
    object.state.results[field_name] = {
      'field_name': field_name,
      'result': Number.isInteger(newValue) && newValue === 1 ? '' : ( newValue.length > 0 ? '' : 'error' )
    }
  }
  object.setState( {[field_name]: newValue} )
}

/**
 * Set button state depending on filled forms.
 *
 * @param object
 */
export function setButtonDisabledState( object ) {
  let fields_count = 0;
  let fields_filled_count = 0;
  {Object.keys(object.state.fields[object.state.step]).map( field_name => {
    fields_count++;
    if( object.state[field_name] && object.state.results[field_name] && object.state.results[field_name].result.length === 0 ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'Text' ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'ProgressBar' && ! object.state.finish_button_disabled ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'TextControl' && ! object.state.fields[object.state.step][field_name].required ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'TextControl' && object.state.fields[object.state.step][field_name].required && object.state.results[field_name] && object.state.results[field_name].filled && object.state.results[field_name].result.length === 0 ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'CheckboxControl' && ! object.state.fields[object.state.step][field_name].required ) {
      fields_filled_count++;
    }
    else if( object.state.fields[object.state.step][field_name].type === 'CheckboxControl' && object.state.fields[object.state.step][field_name].required && object.state.results[field_name] && object.state.results[field_name].filled ) {
      fields_filled_count++;
    }
  })}
  object.state.button_disabled = fields_count !== fields_filled_count;
}

/**
 * Show error.
 *
 * @param error
 */
export function showError( error ) {
  alert(easy_setup_for_wordpress.txt_error_1 + ' ' + error);
}
