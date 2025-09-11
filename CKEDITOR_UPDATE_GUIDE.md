# CKEditor Update Guide

This document outlines the updates made to `Olive.MvcJs` to support the latest CKEditor versions (both v4 and v5).

## What's New

### 1. Dual Version Support
The package now automatically detects and supports both CKEditor 4 and CKEditor 5:
- **Auto-detection**: Automatically determines which version is available
- **Fallback support**: Falls back to CKEditor 4 if CKEditor 5 is not available
- **Backward compatibility**: Existing CKEditor 4 implementations continue to work

### 2. Updated Components

#### HtmlEditor (`src/plugins/htmlEditor.ts`)
- **Smart detection**: Automatically detects CKEditor 5 vs CKEditor 4
- **Modern API support**: Uses CKEditor 5's `ClassicEditor.create()` method
- **Enhanced toolbar configuration**: Maps toolbar modes to CKEditor 5 toolbar configurations
- **Better error handling**: Graceful fallback to CKEditor 4 on errors

#### CKEditorFileManager (`src/plugins/ckEditorFileManager.ts`)
- **Dual file selection handling**: Supports both CKEditor 4 and 5 file selection APIs
- **Modern communication**: Uses postMessage for CKEditor 5 file selection
- **Robust error handling**: Falls back to CKEditor 4 methods if needed

#### Configuration (`src/config.ts`)
- **Version control**: New `CK_EDITOR_VERSION` setting for manual version control
- **Bundle selection**: `CK_EDITOR_5_BUNDLE` setting for different CKEditor 5 bundles
- **CKEditor 5 specific config**: Dedicated configuration object for CKEditor 5 settings

### 3. TypeScript Definitions
Updated `typings-lib/missingDefinitions.d.ts` with proper declarations for:
- CKEditor 4: `CKEDITOR`
- CKEditor 5: `ClassicEditor`, `DecoupledEditor`, `InlineEditor`, `BalloonEditor`, `BalloonBlockEditor`

## Configuration Options

### New Configuration Settings

```typescript
// Version control
Config.CK_EDITOR_VERSION = 'auto'; // 'auto', '4', or '5'

// CKEditor 5 bundle selection
Config.CK_EDITOR_5_BUNDLE = 'classic'; // 'classic', 'decoupled', 'inline', 'balloon', 'balloon-block'

// CKEditor 5 specific settings
Config.CK_EDITOR_5_CONFIG = {
    language: 'en',
    placeholder: 'Enter your content...',
    // Add more CKEditor 5 specific configurations here
};
```

### Toolbar Modes
The following toolbar modes are supported for both CKEditor versions:

- **Compact**: Basic formatting (bold, italic, link)
- **Medium**: Standard editing tools with lists and tables
- **Advance**: Advanced tools including image upload and media embed
- **Full**: Complete feature set including code blocks

## Migration Guide

### For Existing Projects

1. **No immediate changes required**: Existing CKEditor 4 implementations will continue to work
2. **Update CKEditor files**: Replace your CKEditor files with the latest version
3. **Test thoroughly**: Verify all functionality works with your specific CKEditor version

### For New Projects

1. **Choose your CKEditor version**: 
   - Set `Config.CK_EDITOR_VERSION = '5'` for CKEditor 5
   - Set `Config.CK_EDITOR_VERSION = '4'` for CKEditor 4
   - Leave as `'auto'` for automatic detection

2. **Select CKEditor 5 bundle** (if using CKEditor 5):
   - `'classic'`: Traditional editor with toolbar
   - `'decoupled'`: Toolbar separate from content area
   - `'inline'`: Inline editing
   - `'balloon'`: Floating toolbar
   - `'balloon-block'`: Block-level floating toolbar

3. **Customize configuration**: Update `Config.CK_EDITOR_5_CONFIG` for your needs

## File Structure Requirements

### For CKEditor 4
```
/lib/ckeditor/
├── ckeditor.js
├── contents.css
└── ... (other CKEditor 4 files)
```

### For CKEditor 5
```
/lib/ckeditor/
├── ckeditor.js (CKEditor 5 bundle)
└── ... (other CKEditor 5 files)
```

## Browser Compatibility

- **CKEditor 4**: Supports all modern browsers
- **CKEditor 5**: Requires modern browsers with ES6+ support
- **Automatic fallback**: Falls back to CKEditor 4 if CKEditor 5 is not supported

## Troubleshooting

### Common Issues

1. **CKEditor 5 not loading**: Check that the correct bundle is loaded
2. **File manager not working**: Ensure proper postMessage handling for CKEditor 5
3. **Toolbar not displaying**: Verify toolbar configuration matches your CKEditor version

### Debug Mode

Enable console logging to see which CKEditor version is being used:
```javascript
// The component will log which version it detects and uses
console.log("CKEditor version detected:", version);
```

## Support

For issues or questions regarding CKEditor integration:
1. Check the browser console for error messages
2. Verify your CKEditor files are properly loaded
3. Ensure configuration settings match your CKEditor version
4. Test with both CKEditor 4 and 5 to isolate version-specific issues
