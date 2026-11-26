( function ( blocks, element, blockEditor, components, i18n, data ) {
	'use strict';

	var el = element.createElement;
	var registerBlockType = blocks.registerBlockType;
	var RichText = blockEditor.RichText;
	var InnerBlocks = blockEditor.InnerBlocks;
	var MediaUpload = blockEditor.MediaUpload;
	var MediaUploadCheck = blockEditor.MediaUploadCheck;
	var BlockControls = blockEditor.BlockControls;
	var ToolbarButton = components.ToolbarButton;
	var Button = components.Button;
	var TextareaControl = components.TextareaControl;
	var __ = i18n.__;

	var icon = el( 'svg', { viewBox: '0 0 24 24', width: 24, height: 24 },
		el( 'path', { d: 'M4 5h16v14H4zM7 8h10v2H7zm0 4h7v2H7z', fill: 'currentColor' } )
	);

	registerBlockType( 'mbsi/container', {
		title: __( 'MBSI Layout Container', 'mbsi-core' ),
		description: __( 'A protected MBSI layout wrapper. Add or rearrange content blocks inside it.', 'mbsi-core' ),
		icon: icon,
		category: 'design',
		attributes: {
			tagName: { type: 'string', default: 'div' },
			htmlClass: { type: 'string', default: '' },
			htmlId: { type: 'string', default: '' },
			htmlAttributes: { type: 'object', default: {} }
		},
		supports: { html: false, customClassName: false, reusable: true },
		edit: function ( props ) {
			var pageSlug = '';
			try {
				pageSlug = data.select( 'core/editor' ).getEditedPostAttribute( 'slug' ) || '';
			} catch ( error ) {
				pageSlug = '';
			}
			var classes = 'mbsi-editor-container ' + ( props.attributes.htmlClass || '' ) + ( pageSlug ? ' mbsi-editor-page-' + pageSlug : '' );
			var protectedHero = /(?:^|\s)(?:page-hero|contact-hero|about-hero|career-hero|mbsi-resource-hero)(?:\s|$)/.test( props.attributes.htmlClass || '' );
			return el( 'div', { className: classes, 'data-mbsi-tag': props.attributes.tagName || 'div' },
				el( InnerBlocks, { renderAppender: protectedHero ? false : InnerBlocks.ButtonBlockAppender } )
			);
		},
		save: function () { return el( InnerBlocks.Content ); }
	} );

	registerBlockType( 'mbsi/text', {
		title: __( 'MBSI Text', 'mbsi-core' ),
		description: __( 'Editable text that inherits the approved MBSI typography.', 'mbsi-core' ),
		icon: 'editor-textcolor',
		category: 'text',
		attributes: {
			tagName: { type: 'string', default: 'p' },
			htmlClass: { type: 'string', default: '' },
			htmlId: { type: 'string', default: '' },
			htmlAttributes: { type: 'object', default: {} },
			content: { type: 'string', default: '' }
		},
		supports: { html: false, customClassName: false, reusable: true },
		edit: function ( props ) {
			var tag = props.attributes.tagName || 'p';
			var allowed = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'small', 'label', 'button', 'a', 'li', 'blockquote', 'cite', 'div' ];
			if ( allowed.indexOf( tag ) === -1 ) { tag = 'p'; }
			return el( RichText, {
				tagName: tag,
				className: props.attributes.htmlClass || '',
				value: props.attributes.content,
				allowedFormats: [ 'core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'core/subscript', 'core/superscript' ],
				onChange: function ( content ) { props.setAttributes( { content: content } ); },
				placeholder: __( 'Add text…', 'mbsi-core' )
			} );
		},
		save: function () { return null; }
	} );

	registerBlockType( 'mbsi/image', {
		title: __( 'MBSI Image', 'mbsi-core' ),
		description: __( 'An editable image that keeps the approved layout and crop.', 'mbsi-core' ),
		icon: 'format-image',
		category: 'media',
		attributes: {
			id: { type: 'number', default: 0 }, src: { type: 'string', default: '' }, alt: { type: 'string', default: '' },
			htmlClass: { type: 'string', default: '' }, htmlAttributes: { type: 'object', default: {} }
		},
		supports: { html: false, customClassName: false, reusable: true },
		edit: function ( props ) {
			var image = props.attributes.src ? el( 'img', { src: props.attributes.src, alt: props.attributes.alt || '', className: props.attributes.htmlClass || '' } ) : el( 'span', {}, __( 'Choose an image', 'mbsi-core' ) );
			return el( 'div', { className: 'mbsi-editor-image' },
				el( MediaUploadCheck, {},
					el( MediaUpload, {
						onSelect: function ( media ) { props.setAttributes( { id: media.id, src: media.url, alt: media.alt || '' } ); },
						allowedTypes: [ 'image' ], value: props.attributes.id,
						render: function ( obj ) { return el( Button, { onClick: obj.open, className: 'mbsi-editor-image__button' }, image ); }
					} )
				)
			);
		},
		save: function () { return null; }
	} );

	registerBlockType( 'mbsi/markup', {
		title: __( 'MBSI Protected Element', 'mbsi-core' ),
		description: __( 'A decorative or functional element protected from accidental visual changes.', 'mbsi-core' ),
		icon: 'lock',
		category: 'widgets',
		attributes: { markup: { type: 'string', default: '' }, label: { type: 'string', default: 'Protected design element' } },
		supports: { html: false, customClassName: false, reusable: false },
		edit: function ( props ) {
			return el( 'div', { className: 'mbsi-editor-protected' },
				el( 'span', { className: 'dashicons dashicons-lock', 'aria-hidden': true } ),
				el( 'strong', {}, props.attributes.label || __( 'Protected design element', 'mbsi-core' ) ),
				el( 'div', { className: 'mbsi-editor-protected__preview', dangerouslySetInnerHTML: { __html: props.attributes.markup || '' } } )
			);
		},
		save: function () { return null; }
	} );

	registerBlockType( 'mbsi/resource-archive', {
		title: __( 'MBSI Article Listing', 'mbsi-core' ),
		description: __( 'Displays published resource articles. Manage the articles under Posts.', 'mbsi-core' ),
		icon: 'list-view',
		category: 'widgets',
		attributes: { category: { type: 'string', default: '' } },
		supports: { html: false, customClassName: false, reusable: false },
		edit: function ( props ) {
			var category = props.attributes.category || __( 'All resource categories', 'mbsi-core' );
			return el( 'div', { className: 'mbsi-editor-dynamic-listing' },
				el( 'span', { className: 'dashicons dashicons-list-view', 'aria-hidden': true } ),
				el( 'div', {},
					el( 'strong', {}, __( 'Dynamic article listing', 'mbsi-core' ) ),
					el( 'p', {}, __( 'Showing: ', 'mbsi-core' ) + category ),
					el( 'small', {}, __( 'Add, edit, or remove the cards from WordPress Admin > Posts.', 'mbsi-core' ) )
				)
			);
		},
		save: function () { return null; }
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.i18n, window.wp.data );
