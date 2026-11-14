# Easy Setup for WordPress

## Hint

This is the successor to _WP Easy Setup_. The new name became necessary due to the abbreviations used.

### Changes

#### Hooks

wp_easy_setup_skip => esfw_skip
wp_easy_setup_step => esfw_steps
wp_easy_setup_process_init => esfw_process_init
wp_easy_setup_process => esfw_process
wp_easy_setup_completed => esfw_completed
wp_easy_setup_set_completed => esfw_set_completed
wp_easy_setup_step_label => esfw_step_label
wp_easy_setup_max_steps => esfw_max_steps

## Requirements

* composer to install this package.
* npm to compile the scripts.
* WordPress-plugin where this setup will be used

## Installation

1. ``composer require threadi/easy-setup-for-wordpress``
2. Switch to ``vendor/thread/easy-setup-for-wordpress``
3. Run ``npm i`` to install dependencies.
4. Run ``npm run build`` to compile the scripts.

## Usage

### Embed

Add this in the page where you want to show the setup.

```
$setup_obj = \easySetupForWordPress\Setup::get_instance();
$setup_obj->set_url( 'website-URL' );
$setup_obj->set_path( 'website-path' );
$setup_obj->set_texts( array(
    'title_error'      => __( 'Error', 'your-text-domain' ),
    'txt_error_1'      => __( 'The following error occurred:', 'your-text-domain' ),
    'txt_error_2'      => __( 'text after error', 'your-text-domain' ),
) );
$setup_obj->set_config( array( /* your custom setup configuration */ ) );
echo $setup_obj->display( 'your-setup-name' );
```

**Hint:** line 1 to 4 should be run before any output, e.g. via ``admin_init`` hook.

### Custom configuration

The array _must_ contain following entries:

* name => the unique name for the setup (e.g. the plugin slug)
* title => the language-specific title of the setup for the header of it
* steps => list of steps (see below)
* back_button_label => language-specific title for the back-button
* continue_button_label => language-specific title for the continue-button
* finish_button_label => language-specific title for the finish-button

### Steps

Steps are defined as array with step-number as index and fields-configuration as value. Example:

```
1 => array( /* fields in step 1 */ ),
2 => array( /* fields in step 2 */ )
```

The fields-configuration is defined as array with the following structure:

```
1 => array(
    'field_1_name'              => array(
        'type'                => 'field-type',
        'label'               => __( 'the label', 'your-text-domain' ),
        'help'                => __( 'the help text', 'your-text-domain' ),
        'placeholder'         => __( 'the placeholder', 'your-text-domain' ),
        'required'            => true, // true if required for next step
        'validation_callback' => 'example::validate', // PHP-callback to validate the entry
    ),
    'field_2_name'              => array(
        'type'                => 'field-type',
        'label'               => __( 'the label', 'your-text-domain' ),
        'help'                => __( 'the help text', 'your-text-domain' ),
        'placeholder'         => __( 'the placeholder', 'your-text-domain' ),
        'required'            => true, // true if required for next step
        'validation_callback' => 'example::validate', // PHP-callback to validate the entry
    ),
```

#### Field-types

Following field-types are supported:

* CheckboxControl => shows a simple checkbox for "yes/no"
* ProgressBar => shows a progressbar which will process what is defined via hook "wp_easy_setup_process"
* RadioControl => shows a group of radio-boxes where the user should decide what to choose
* TextControl => shows a single input-text-field
* PasswordControl => shows a single input-field for a password, the input is hidden (see below)
* Text => shows the text you defined in array-key "text"

#### Passwords

Use the PasswordControl for passwords, keys and tokens. It needs the values stored per user (see ``set_user_values()``).

* The value is stored as entered, it is not sanitized like other values.
* The value is never sent back to the browser. After loading the setup again the field is empty.
* An empty field keeps the stored value when the step is saved.
* Use the filter ``esfw_save_password_value`` to change the value before it is stored, e.g. to encrypt it, and the filter ``esfw_get_password_value`` to change it back when it is read via ``get_field_value()``.

Example:

```
add_filter( 'esfw_save_password_value', function( string $value, string $field_name, string $config_name ): string {
    if ( 'your-setup-name' !== $config_name ) {
        return $value;
    }
    return your_encrypt( $value );
}, 10, 3 );
add_filter( 'esfw_get_password_value', function( string $value, string $field_name, string $config_name ): string {
    if ( 'your-setup-name' !== $config_name ) {
        return $value;
    }
    return your_decrypt( $value );
}, 10, 3 );
```

Remove the stored values with ``delete_field_values()`` after the setup has been run.

#### Other array keys

* label => is the label above the field
* help => shows a html-formatted text below the field
* placeholder => is used as such on field which support it
* required => true if field is required for next step
* default => the value the field gets, as long as the user has not entered one. This also works for fields, which are loaded after a step has been saved (see ``update_fields``).
* validation_callback => PHP-callback to validate the entry
