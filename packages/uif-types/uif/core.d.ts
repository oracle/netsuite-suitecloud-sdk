declare module '@uif-js/core/jsx-runtime' {}

declare module '@uif-js/core' {
	import * as Self from '@uif-js/core'
	import * as PackageComponent from '@uif-js/component'

	/**
	 * Accelerator
	 */
	export class Accelerator {
		/**
		 * Constructs Accelerator
		 */
		constructor(options: object);

		/**
		 * Register a shortcut, for example [['CTRL', 'SHIFT', 'A'], ['CTRL', 'B']]
		 */
		registerShortcut(keyStroke: globalThis.Array<Self.KeyStroke.Source>, handler: Self.KeyShortcut.ActionCallback): {unregister: () => void};

		/**
		 * Register shortcut
		 */
		add(shortcut: Self.KeyShortcut): {remove: () => void};

		/**
		 * Unregister shortcut
		 */
		remove(shortcut: Self.KeyShortcut): void;

		/**
		 * Processes message
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace Accelerator {
	}

	/**
	 * Ajax
	 */
	export class Ajax {
		/**
		 * Sends GET request to url
		 */
		static get(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

		/**
		 * Sends POST request to url
		 */
		static post(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

		/**
		 * Sends PUT request to url
		 */
		static put(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

		/**
		 * Sends DELETE request to url
		 */
		static delete(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

	}

	export namespace Ajax {
		interface Options {
			async?: boolean;

			cache?: boolean;

			dataType?: Self.Ajax.DataType;

			responseType?: Self.Ajax.ResponseType;

			user?: string;

			password?: string;

			withCredentials?: boolean;

			timeout?: number;

			attempts?: number;

			headers?: object;

			before?: () => void;

			after?: (value: any) => void;

			uploadProgress?: Self.Ajax.ProgressCallback;

			downloadProgress?: Self.Ajax.ProgressCallback;

			chunkReceived?: Self.Ajax.ChunkReceivedCallback;

		}

		type ProgressCallback = (args: {total: number; length: number; lengthComputable: boolean}) => void;

		type ChunkReceivedCallback = (args: {total: number; length: number; lengthComputable: boolean; data: ArrayBuffer}) => void;

		/**
		 * Request data type
		 */
		enum DataType {
			POST,
			ARRAYBUFFER,
			BLOB,
			DOCUMENT,
			FORMDATA,
			JSON,
			XML,
		}

		/**
		 * Response data type
		 */
		enum ResponseType {
			AUTO,
			XML,
			TEXT,
			DOCUMENT,
			JSON,
		}

	}

	export class AjaxReporter extends Self.LogReporter {
		/**
		 * Constructs AjaxReporter
		 */
		constructor();

		/**
		 * Url
		 */
		url: string;

		/**
		 * Notification url
		 */
		defaultNotificationUrl: string;

	}

	export namespace AjaxReporter {
	}

	/**
	 * Application context
	 */
	export class AppContext {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * Get/set application title
		 */
		title: string;

		/**
		 * Register before end callback
		 */
		registerBeforeEnd(handler: () => boolean): {remove: () => void};

	}

	export namespace AppContext {
	}

	/**
	 * Application
	 * @deprecated
	 */
	class Application {
		/**
		 * Constructs Application
		 */
		constructor();

		/**
		 * Returns current state
		 */
		state: Self.Application.State;

		/**
		 * The root context
		 */
		context: Self.Context;

		/**
		 * The shell instance
		 */
		shell: PackageComponent.Shell;

		/**
		 * Executes the application
		 */
		run(): globalThis.Promise<void>;

		/**
		 * Disposes application
		 */
		dispose(): void;

	}

	namespace Application {
		enum State {
			NEW,
			INITIALIZING,
			READY,
			DISPOSED,
			ERROR,
		}

	}

	export enum AriaProperty {
		ACTIVE_DESCENDANT,
		ATOMIC,
		AUTOCOMPLETE,
		CONTROLS,
		DESCRIBED_BY,
		DROP_EFFECT,
		FLOW_TO,
		HAS_POPUP,
		LABEL,
		LABELLED_BY,
		LEVEL,
		LIVE,
		MODAL,
		MULTILINE,
		MULTISELECTABLE,
		ORIENTATION,
		OWNS,
		POS_IN_SET,
		READ_ONLY,
		RELEVANT,
		ROLE,
		KEY_SHORTCUTS,
		REQUIRED,
		SET_SIZE,
		SORT,
		VALUE_MAX,
		VALUE_MIN,
		VALUE_NOW,
		VALUE_TEXT,
	}

	export enum AriaRole {
		ALERT,
		ALERT_DIALOG,
		APPLICATION,
		ARTICLE,
		BANNER,
		BUTTON,
		CELL,
		CHECK_BOX,
		COLUMN_HEADER,
		COMBO_BOX,
		COMMAND,
		COMPLEMENTARY,
		COMPOSITE,
		CONTENT_INFO,
		DEFINITION,
		DIALOG,
		DIRECTORY,
		DOCUMENT,
		FEED,
		FIGURE,
		FORM,
		GRID,
		GRID_CELL,
		GROUP,
		HEADING,
		IMG,
		INPUT,
		LANDMARK,
		LINK,
		LIST,
		LIST_BOX,
		LIST_ITEM,
		LOG,
		MAIN,
		MARQUEE,
		MATH,
		MENU,
		MENU_BAR,
		MENU_ITEM,
		MENU_ITEM_CHECK_BOX,
		MENU_ITEM_RADIO,
		NAVIGATION,
		NONE,
		NOTE,
		OPTION,
		PRESENTATION,
		PROGRESS_BAR,
		RADIO,
		RADIO_GROUP,
		RANGE,
		REGION,
		ROLE_TYPE,
		ROW,
		ROW_GROUP,
		ROW_HEADER,
		SCROLLBAR,
		SEARCH,
		SEARCH_BOX,
		SECTION,
		SECTION_HEAD,
		SELECT,
		SEPARATOR,
		SLIDER,
		SPIN_BUTTON,
		STATUS,
		STRUCTURE,
		SWITCH,
		TAB,
		TABLE,
		TAB_LIST,
		TAB_PANEL,
		TERM,
		TEXT_BOX,
		TIMER,
		TOOLBAR,
		TOOLTIP,
		TREE,
		TREE_GRID,
		TREE_ITEM,
		WIDGET,
		WINDOW,
	}

	export enum AriaState {
		BUSY,
		CHECKED,
		DISABLED,
		EXPANDED,
		GRABBED,
		HIDDEN,
		INVALID,
		PRESSED,
		SELECTED,
		CURRENT,
	}

	export namespace AriaValue {
		enum AutoComplete {
			INLINE,
			LIST,
			BOTH,
			NONE,
		}

		enum Current {
			PAGE,
			STEP,
			LOCATION,
			DATE,
			TIME,
		}

		enum DropEffect {
			COPY,
			EXECUTE,
			LINK,
			MOVE,
			NONE,
			POPUP,
		}

		enum HasPopup {
			MENU,
			LIST_BOX,
			TREE,
			GRID,
			DIALOG,
		}

		enum Live {
			ASSERTIVE,
			OFF,
			POLITE,
		}

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

		enum Relevant {
			ADDITIONS,
			ADDITIONS_TEXT,
			ALL,
			REMOVALS,
			TEXT,
		}

		enum Sort {
			ASCENDING,
			DESCENDING,
			NONE,
			OTHER,
		}

	}

	/**
	 * Utility functions for arrays
	 */
	export namespace Array {
		/**
		 * Create a new array initialized using the given initializer function
		 */
		function generate(size: number, initializer: (index: number) => any): globalThis.Array<any>;

		/**
		 * Create a new 2D array initialized using the given initializer function
		 */
		function generateMatrix(width: number, height: number, initializer: (row: number, column: number) => any): globalThis.Array<globalThis.Array<any>>;

		/**
		 * Check if array is empty
		 */
		function isEmpty(array: globalThis.Array<any>): boolean;

		/**
		 * Check whether both arrays have equal content
		 */
		function equals(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): boolean;

		/**
		 * Create an array from an array like or iterable object
		 */
		function from(arrayLike: any): globalThis.Array<any>;

		/**
		 * Converts a value to an array. If the value is already an array then it is returned as it is. If the value is undefined or null empty array is returned.
		 */
		function fromValue(value: any): globalThis.Array<any>;

		/**
		 * Converts a list of values to an array skipping null and undefined
		 */
		function fromValues(...list: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Convert array-like object to a standard JS array. Array-like object is an object that has the length property and allows item access via the [] operator. Examples are the arguments objects or strings.
		 */
		function fromArrayLike(arg: object): globalThis.Array<any>;

		/**
		 * Construct array from ES6 iterable object
		 */
		function fromIterator(arg: any): globalThis.Array<any>;

		interface FindResult {
			found: boolean;

			item?: any;

			index?: number;

		}

		/**
		 * Find the first element in array using a predicate.
		 */
		function findFirst(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): Self.Array.FindResult;

		/**
		 * Find the last element in array using a predicate.
		 */
		function findLast(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): Self.Array.FindResult;

		/**
		 * Check whether array contains given value
		 */
		function contains(array: globalThis.Array<any>, value: any): boolean;

		/**
		 * Check whether the first array contains all values from the second array
		 */
		function containsAll(array1: globalThis.Array<any>, array2: globalThis.Array<any>): boolean;

		/**
		 * Check if the array contains a value matching the predicate
		 */
		function containsMatching(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): boolean;

		/**
		 * Copy array
		 */
		function copy(array: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Deep copy an array
		 */
		function deepCopy(array: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Reverse array (out-of-place)
		 */
		function reverse(array: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Insert item into an array. Modifies the input array.
		 */
		function insert(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		/**
		 * Insert items from a given array into another array. Modifies the input array.
		 */
		function insertAll(array: globalThis.Array<any>, index: number, items: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Changes the position of selected items inplace
		 */
		function reorder(array: globalThis.Array<any>, sourceIndex: number, targetIndex: number, count?: number): globalThis.Array<any>;

		/**
		 * Returns an array that contains all items from the first array that are also in the second array
		 */
		function intersect(left: globalThis.Array<any>, right: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Remove a specific item from an array. If the item appears multiple times in the array then only the first occurrence is removed.
		 */
		function remove(array: globalThis.Array<any>, item: any): boolean;

		/**
		 * Remove items at given index from array
		 */
		function removeAt(array: globalThis.Array<any>, index: number, count?: number): globalThis.Array<any>;

		/**
		 * Remove all items from an array. Only first occurence of each item is removed
		 */
		function removeAll(array: globalThis.Array<any>, items: globalThis.Array<any>): number;

		/**
		 * Keep all items matching the predicate
		 */
		function filter(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): globalThis.Array<{index: number; item: any}>;

		/**
		 * Transform all array items
		 */
		function map(array: globalThis.Array<any>, transform: (item: any, index: number) => any): void;

		/**
		 * Concatenates two array in place. All items from the second array are appended to the first array which is also returned.
		 */
		function concat(left: globalThis.Array<any>, right: globalThis.Array<any>): void;

		/**
		 * Appends reversed second array to the first array
		 */
		function concatReversed(left: globalThis.Array<any>, right: globalThis.Array<any>): void;

		/**
		 * Convert array to object
		 */
		function toObject(array: globalThis.Array<any>, mapper?: (item: any, index: number) => ({key: string; value: any} | null)): object;

		/**
		 * Create array of {count} items increasing by step
		 */
		function range(from: number, count: number, step?: number): globalThis.Array<any>;

		/**
		 * Create an array of {count} items where all items will be initialized to a given value
		 */
		function repeat(value: any, count: number): globalThis.Array<any>;

		/**
		 * Get first item from array or null if array is empty
		 */
		function firstItem(array: globalThis.Array<any>): (any | null);

		/**
		 * Get first item from array or default value if array is empty
		 */
		function firstItemOrDefault(array: globalThis.Array<any>, defaultValue: any): any;

		/**
		 * Get last item from array or null if array is empty
		 */
		function lastItem(array: globalThis.Array<any>): (any | null);

		/**
		 * Get last item from array or default value if array is empty
		 */
		function lastItemOrDefault(array: globalThis.Array<any>, defaultValue: any): any;

		/**
		 * Returns a random item from the array
		 */
		function randomItem(array: globalThis.Array<any>): (null | any);

		/**
		 * Find item using binary search
		 */
		function binarySearch(array: globalThis.Array<any>, comparator: (left: any, right: any) => number): {found: boolean; index: number};

		/**
		 * Returns items in the left array that are not in the right one.
		 */
		function diff(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		/**
		 * Returns items in the left array that are not in the right one. Assumes both arrays are sorted using the comparator.
		 */
		function diffSorted(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		/**
		 * Returns items in the left array that are not in the right one. Faster than diff but needs a key providing function.
		 */
		function diffByKey(left: globalThis.Array<any>, right: globalThis.Array<any>, keyExtractor?: (item: any) => any): globalThis.Array<any>;

		/**
		 * Remove duplicates from an array
		 */
		function deduplicate(array: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		/**
		 * Remove duplicates from a sorted array
		 */
		function deduplicateSorted(array: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		/**
		 * Remove duplicates from an array. Faster than deduplicate but needs a key provider.
		 */
		function deduplicateByKey(array: globalThis.Array<any>, keyExtractor?: (item: any) => any): globalThis.Array<any>;

		/**
		 * Shuffles array in-place using the Fisher-Yates method
		 */
		function shuffle(array: globalThis.Array<any>): void;

		/**
		 * Find the length of the longest common prefix of two arrays
		 */
		function commonPrefixLength(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): void;

		/**
		 * Find the length of the longest common suffix of two arrays
		 */
		function commonSuffixLength(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): void;

		/**
		 * Empty array constant
		 */
		const EMPTY: globalThis.Array<any>;

	}

	/**
	 * Simple array based data source
	 */
	export class ArrayDataSource implements Self.MutableDataSource, Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs ArrayDataSource
		 */
		constructor(array?: globalThis.Array<any>);

		/**
		 * Number of items in the data source
		 */
		length: number;

		/**
		 * True if the data source is empty
		 */
		empty: boolean;

		/**
		 * Item iterator
		 */
		[Symbol.iterator](): any;

		/**
		 * First item in the data source or null if empty
		 */
		firstItem: (any | null);

		/**
		 * Last item in the data source or null if empty
		 */
		lastItem: (any | null);

		/**
		 * Query data source items
		 */
		query(args: Self.DataSource.QueryArguments, onResult: (args: {items: globalThis.Array<any>}) => void, onError?: (error: any) => void): void;

		/**
		 * Adds items to the collection
		 */
		add(args: {item?: any; items?: globalThis.Array<any>; index?: number; reason?: string}): object;

		/**
		 * Remove items from the collection
		 */
		remove(args: {item?: any; items?: globalThis.Array<any>; index?: number; count?: number; reason?: string}): object;

		/**
		 * Remove all items from the data source
		 */
		clear(): void;

		/**
		 * Change order of elements in the collection. Moves a chunk of items from one position to another.
		 */
		move(args: {sourceIndex: number; targetIndex: number; count?: number; reason?: string}): object;

		/**
		 * Run callback for all items in the data source
		 */
		forEach(callback: (item: any, index: number) => void): void;

		/**
		 * Returns a new filtered data source
		 */
		filter(filter: (item: any, index: number) => boolean): Self.ArrayDataSource;

		/**
		 * Returns a new transformed data source
		 */
		map(transform: (item: any, index: number) => any): Self.ArrayDataSource;

		/**
		 * Returns a new sorted data source
		 */
		sort(comparator: (left: any, right: any) => number): Self.ArrayDataSource;

		/**
		 * Return the item at a particular index
		 */
		itemAtIndex(index: number): any;

		/**
		 * Convert the data source to an array
		 */
		toArray(): globalThis.Array<any>;

		/**
		 * Find the index of a particular item
		 */
		indexOf(item: any): (number | null);

		/**
		 * Check if the data source contains a particular item
		 */
		contains(item: any): boolean;

		/**
		 * Check if the data source contains an item matching the predicate
		 */
		containsMatching(predicate: (item: any) => boolean): boolean;

		/**
		 * Find the first element matching a predicate.
		 */
		findFirst(predicate: (item: any) => boolean): {found: boolean; item: (any | null); index: (number | null)};

		/**
		 * Find the last element matching a predicate.
		 */
		findLast(predicate: (item: any) => boolean): {found: boolean; item: (any | null); index: (number | null)};

	}

	export namespace ArrayDataSource {
	}

	/**
	 * Assertions
	 */
	export namespace Assert {
		/**
		 * Verify that value is defined and is not null
		 */
		function checkNotNull(value: any, message?: string): void;

		/**
		 * Verify that argument value complies with a specific precondition
		 */
		function checkArgument(condition: boolean, message?: string): void;

		/**
		 * Verify that program state complies with a specific precondition
		 */
		function checkState(condition: boolean, message?: string): void;

		/**
		 * Verify that value is a valid index
		 */
		function checkIndex(index: number, size: number, message?: string): void;

		/**
		 * Verify that value is between start and end arguments
		 */
		function checkRange(value: number, start: number, end: number, message?: string): void;

		/**
		 * Verify that value is of given type(s)
		 */
		function checkType(value: any, type: Self.Type.Matcher, message?: (string | (() => string))): void;

		/**
		 * Always throws error
		 */
		function fail(message?: string): void;

		/**
		 * Checks that property is of given type and automatically generates error message
		 */
		function checkProperty(value: any, type: Self.Type.Matcher, name: string): void;

		/**
		 * Checks object properties for given property types
		 */
		function checkProperties(properties: object, types: Record<string, Self.Type.Matcher>): void;

	}

	/**
	 * Async utility functions
	 */
	export namespace Async {
		/**
		 * Delay for a selected amount of milliseconds
		 */
		function delay(timeout: number): globalThis.Promise<any>;

	}

	export class BrowserConsoleReporter extends Self.LogReporter {
		/**
		 * Constructs BrowserConsoleReporter
		 */
		constructor();

		/**
		 * Whether all types of logs should be displayed using console.trace() This is helpful when debugging in Chrome as it show a message with a clickable call stack. In Firefox and IE11 it also shows a call stack, but does not show the message itself (this is a reported bug).
		 */
		useTraceForAll: boolean;

	}

	export namespace BrowserConsoleReporter {
	}

	/**
	 * Bundle manager
	 */
	class BundleManager {
	}

	namespace BundleManager {
	}

	/**
	 * Cancellation token
	 */
	export class CancellationToken {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * True if the operation has been cancelled
		 */
		cancelled: boolean;

		/**
		 * Register a callback that will be called when the associated operation is cancelled. It the operation is already cancelled the callback will be executed immediately.
		 */
		onCancel(callback: (args: object) => void): void;

		/**
		 * Cancel the token
		 */
		private _cancel(args: object): void;

	}

	export namespace CancellationToken {
	}

	/**
	 * Cancellation token source
	 */
	export class CancellationTokenSource {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * Check if token is cancelled
		 */
		cancelled: boolean;

		/**
		 * Get token
		 */
		token: Self.CancellationToken;

		/**
		 * Cancel token
		 */
		cancel(args: object): void;

	}

	export namespace CancellationTokenSource {
	}

	export namespace Class {
		/**
		 * Create a new class object according to the definition
		 */
		function create(definition: {initialize?: (...args: globalThis.Array<any>) => any; methods?: object; overrides?: object; properties?: object; events?: boolean; automationId?: string; mixin?: (Self.Mixin | globalThis.Array<Self.Mixin>); static?: object; extend?: object; implement?: (Self.Interface | globalThis.Array<Self.Interface>)}): (...args: globalThis.Array<any>) => any;

		/**
		 * Describe a native JS class. It is possible to specify implemented interfaces, add mixins and other features supported by Class.create.
		 */
		function describe(Class: (...args: globalThis.Array<any>) => any, options: {automationId?: string; methods?: object; overrides?: object; properties?: object; events?: boolean; mixin?: (Self.Mixin | globalThis.Array<Self.Mixin>); static?: object; implement?: (Self.Interface | globalThis.Array<Self.Interface>)}): Self.ReflectionClassDescriptor;

		/**
		 * @deprecated
		 */
		function hasProperty(): void;

		/**
		 * @deprecated
		 */
		function getProperty(): void;

		/**
		 * @deprecated
		 */
		function getProperties(): void;

	}

	/**
	 * Class descriptor
	 */
	class ClassDescriptor {
	}

	namespace ClassDescriptor {
	}

	export class ClipboardMessage extends Self.RoutedMessage {
		/**
		 * Constructs ClipboardMessage
		 */
		constructor(options: Self.ClipboardMessage.Options);

		element: EventTarget;

		/**
		 * DataTransfer object containing the data affected by the user-initiated cut, copy, or paste operation, along with its MIME type
		 */
		clipboardData: DataTransfer;

		/**
		 * Gets data of mime type
		 */
		getData(mimeType?: string): string;

		static fromEvent(event: ClipboardEvent): Self.ClipboardMessage;

	}

	export namespace ClipboardMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

			clipboardData: DataTransfer;

		}

	}

	/**
	 * Utility class representing color with methods for conversions between different color models and color modifications
	 */
	export class Color {
		/**
		 * Constructs Color
		 */
		constructor(color: Self.Color.Definition, type?: Self.Color.Model);

		/**
		 * Gets color in HEX model
		 */
		hex: Self.Color.HEXObject;

		/**
		 * Gets color in RGB model
		 */
		rgb: Self.Color.RGBObject;

		/**
		 * Gets color in CMYK model
		 */
		cmyk: Self.Color.CMYKObject;

		/**
		 * Gets color in HSL model
		 */
		hsl: object;

		/**
		 * Gets color in HSV model
		 */
		hsv: Self.Color.HSVObject;

		/**
		 * Gets color in HWB model
		 */
		hwb: Self.Color.HWBObject;

		/**
		 * Gets color in grayscale model
		 */
		grayscale: Self.Color.GrayscaleObject;

		/**
		 * Gets color alpha channel
		 */
		alpha: object;

		/**
		 * Gets color's complement
		 */
		complement: Self.Color;

		/**
		 * Gets color luminosity - https://www.w3.org/TR/WCAG20/#relativeluminancedef
		 */
		luminosity: number;

		/**
		 * Determines if the color is dark - https://24ways.org/2010/calculating-color-contrast/
		 */
		isDark: boolean;

		/**
		 * Determines if the color is light - https://24ways.org/2010/calculating-color-contrast/
		 */
		isLight: boolean;

		/**
		 * Sets color
		 */
		setColor(color: Self.Color.Definition, type?: Self.Color.Model): Self.Color;

		/**
		 * Sets red channel
		 */
		setRed(red: number): Self.Color;

		/**
		 * Sets green channel
		 */
		setGreen(green: number): Self.Color;

		/**
		 * Sets blue channel
		 */
		setBlue(blue: number): Self.Color;

		/**
		 * Sets cyan channel
		 */
		setCyan(cyan: number): Self.Color;

		/**
		 * Sets magenta channel
		 */
		setMagenta(magenta: number): Self.Color;

		/**
		 * Sets yellow channel
		 */
		setYellow(yellow: number): Self.Color;

		/**
		 * Sets black channel
		 */
		setBlack(black: number): Self.Color;

		/**
		 * Adjusts hue channel set as the current value
		 */
		adjustHue(degrees: number): Self.Color;

		/**
		 * Decreases saturation channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		desaturate(ratio: number): Self.Color;

		/**
		 * Decreases saturation channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		desaturateByAmount(amount: number): Self.Color;

		/**
		 * Increases saturation level by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		saturate(ratio: number): Self.Color;

		/**
		 * Increases saturation level by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		saturateByAmount(amount: number): Self.Color;

		/**
		 * Decreases lightness channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		darken(ratio: number): Self.Color;

		/**
		 * Decreases lightness channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		darkenByAmount(amount: number): Self.Color;

		/**
		 * Increases lightness channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		lighten(ratio: number): Self.Color;

		/**
		 * Increases lightness channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		lightenByAmount(amount: number): Self.Color;

		/**
		 * Increases blackness channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		blacken(ratio: number): Self.Color;

		/**
		 * Increases blackness channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		blackenByAmount(amount: number): Self.Color;

		/**
		 * Increases whiteness channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		whiten(ratio: number): Self.Color;

		/**
		 * Increases whiteness channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		whitenByAmount(amount: number): Self.Color;

		/**
		 * Decreases alpha channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		fade(ratio: number): Self.Color;

		/**
		 * Decreases alpha channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		fadeByAmount(amount: number): Self.Color;

		/**
		 * Increases alpha channel by ratio - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		opaquer(ratio: number): Self.Color;

		/**
		 * Increases alpha channel by amount - if minimum/maximum (0/1) value for the channel is exceeded, that minimum/maximum value is set as the current value
		 */
		opaquerByAmount(amount: number): Self.Color;

		/**
		 * Sets hue channel
		 */
		setHue(hue: number): Self.Color;

		/**
		 * Sets saturation channel in HSL model
		 */
		setSaturationHsl(saturation: number): Self.Color;

		/**
		 * Sets lightness channel
		 */
		setLightness(lightness: number): Self.Color;

		/**
		 * Sets saturation channel in HSV model
		 */
		setSaturationHsv(saturation: number): Self.Color;

		/**
		 * Sets value channel
		 */
		setValue(value: number): Self.Color;

		/**
		 * Sets whiteness channel
		 */
		setWhiteness(whiteness: number): Self.Color;

		/**
		 * Sets blackness channel
		 */
		setBlackness(blackness: number): Self.Color;

		/**
		 * Sets alpha channel
		 */
		setAlpha(alpha: number): Self.Color;

		/**
		 * Negates the color (turns it into the original color's complement)
		 */
		negate(): void;

		/**
		 * Returns true if color is equal to different color
		 */
		isEqual(color: Self.Color): boolean;

		/**
		 * Mixes two colors by given weight
		 */
		mix(color: Self.Color, weight?: number): void;

		/**
		 * Returns copy of the color
		 */
		copy(): Self.Color;

		/**
		 * Convert the Color to a CSS string
		 */
		toString(): string;

		/**
		 * Transforms 0-255 range to percents
		 */
		private _eightBitChannelToPercent(channel: number): number;

		/**
		 * Transforms 0-1 range to percents
		 */
		private _zeroToOneChannelToPercent(channel: number): number;

		/**
		 * Converts RGB to HEX
		 */
		static rgbToHex(rgb: Self.Color.RGB, withAlpha?: boolean): Self.Color.HEX;

		/**
		 * Converts RGB to CMYK
		 */
		static rgbToCmyk(rgb: Self.Color.RGB): Self.Color.CMYK;

		/**
		 * Converts RGB to HSL
		 */
		static rgbToHsl(rgb: Self.Color.RGB): Self.Color.HSL;

		/**
		 * Converts RGB to HSV
		 */
		static rgbToHsv(rgb: Self.Color.RGB): Self.Color.HSV;

		/**
		 * Converts RGB to Greyscale with luminosity method
		 */
		static rgbToGrayscaleLuminosity(rgb: Self.Color.RGB): number;

		/**
		 * Converts RGB to Greyscale with lightness method
		 */
		static rgbToGrayscaleLightness(rgb: Self.Color.RGB): number;

		/**
		 * Converts RGB to Greyscale with average method
		 */
		static rgbToGrayscaleAverage(rgb: Self.Color.RGB): number;

		/**
		 * Converts HEX to RGB
		 */
		static hexToRgb(hex: Self.Color.HEX): Self.Color.RGB;

		/**
		 * Transforms short hex notation (#fff/#ffff) to the long one (#ffffff/#ffffffff)
		 */
		static shortHexToLong(hex: Self.Color.HEX): Self.Color.HEX;

		/**
		 * Gets alpha value from the HEX notation
		 */
		static getAlphaFromHex(hex: Self.Color.HEX): number;

		/**
		 * Strips the alpha value from the HEX notation (#ffff/#ffffffff -> #fff/#ffffff)
		 */
		static getHexWithoutAlpha(hex: Self.Color.HEX): Self.Color.HEX;

		/**
		 * Converts CMYK to RGB
		 */
		static cmykToRgb(cmyk: Self.Color.CMYK): Self.Color.RGB;

		/**
		 * Converts HSL to RGB
		 */
		static hslToRgb(hsl: Self.Color.HSL): Self.Color.RGB;

		/**
		 * Converts HSV to RGB
		 */
		static hsvToRgb(hsv: Self.Color.HSV): Self.Color.RGB;

		/**
		 * Converts HSV to HSL
		 */
		static hsvToHsl(hsv: Self.Color.HSV): Self.Color.HSL;

		/**
		 * Converts HSV to HWB
		 */
		static hsvToHwb(hsv: Self.Color.HSV): Self.Color.HWB;

		/**
		 * Converts HSL to HSV
		 */
		static hslToHsv(hsl: Self.Color.HSL): Self.Color.HSV;

		/**
		 * Converts HWB to HSV
		 */
		static hwbToHsv(hwb: Self.Color.HWB): Self.Color.HSV;

		/**
		 * Checks if the color is in valid HEX format
		 */
		static isHex(hex: Self.Color.HEX): boolean;

		/**
		 * Checks if the color is in valid RGB format
		 */
		static isRgb(rgb: Self.Color.RGB): boolean;

		/**
		 * Checks if the color is in valid CMYK format
		 */
		static isCmyk(cmyk: Self.Color.CMYK): boolean;

		/**
		 * Checks if the color is in valid HSL format
		 */
		static isHsl(hsl: Self.Color.HSL): boolean;

		/**
		 * Checks if the color is in valid HSV format
		 */
		static isHsv(hsv: Self.Color.HSV): boolean;

		/**
		 * Checks if the color is in valid HWB format
		 */
		static isHwb(hwb: Self.Color.HWB): boolean;

		/**
		 * Asserts HEX format
		 */
		static assertHex(hex: any): void;

		/**
		 * Asserts RGB format
		 */
		static assertRgb(rgb: any): void;

		/**
		 * Asserts CMYK format
		 */
		static assertCmyk(cmyk: any): void;

		/**
		 * Asserts HSL format
		 */
		static assertHsl(hsl: any): void;

		/**
		 * Asserts HSV format
		 */
		static assertHsv(hsv: any): void;

		/**
		 * Asserts HWB format
		 */
		static assertHwb(hwb: any): void;

		/**
		 * Factory method for creating color in HEX model
		 */
		static hex(hex: Self.Color.HEX): Self.Color;

		/**
		 * Factory method for creating color in RGB model
		 */
		static rgb(redOrColorObject: (number | Self.Color.RGB), green?: number, blue?: number, alpha?: number): Self.Color;

		/**
		 * Factory method for creating color in CMYK model
		 */
		static cmyk(cyanOrColorObject: (number | Self.Color.CMYK), magenta?: number, yellow?: number, black?: number, alpha?: number): Self.Color;

		/**
		 * Factory method for creating color in HSL model
		 */
		static hsl(hueOrColorObject: (number | Self.Color.HSL), saturation?: number, lightness?: number, alpha?: number): Self.Color;

		/**
		 * Factory method for creating color in HSV model
		 */
		static hsv(hueOrColorObject: (number | Self.Color.HSV), saturation?: number, value?: number, alpha?: number): Self.Color;

		/**
		 * Factory method for creating color in HWB model
		 */
		static hwb(hueOrColorObject: (number | Self.Color.HWB), whiteness?: number, blackness?: number, alpha?: number): Self.Color;

		/**
		 * Factory method for creating color in Grayscale model
		 */
		static grayscale(grayscaleOrColorObject: (number | {grayscale: number; alpha: number}), alpha?: number): Self.Color;

		/**
		 * Computes contrast between two colors - https://www.w3.org/TR/WCAG20/#contrast-ratiodef
		 */
		static contrastRatio(color1: Self.Color, color2: Self.Color): number;

		/**
		 * Computes contrast level between two colors for normal text - https://www.w3.org/TR/WCAG/#contrast-minimum
		 */
		static contrastLevelNormalText(color1: Self.Color, color2: Self.Color): string;

		/**
		 * Computes contrast level between two colors for large text - https://www.w3.org/TR/WCAG/#contrast-minimum
		 */
		static contrastLevelLargeText(color1: Self.Color, color2: Self.Color): string;

		/**
		 * Returns true if the two provided colors are the same
		 */
		static isEqual(color1: (Self.Color | Self.Color.HEX | null), color2: (Self.Color | Self.Color.HEX | null)): boolean;

		/**
		 * Mixes two colors by given weight (https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209)
		 */
		static mix(color1: Self.Color, color2: Self.Color, weight?: number): void;

		/**
		 * Returns a copy of the given color
		 */
		static copy(color: Self.Color): Self.Color;

		/**
		 * Parses Color.HEX or instance of a Color to instance of a Color
		 */
		static parseColor(hexOrColor: (Self.Color | Self.Color.HEX)): (Self.Color | null);

		/**
		 * Parses instance of a Color or Color.HEX to Color.HEX
		 */
		static formatColorToHex(hexOrColor: (Self.Color | Self.Color.HEX)): (Self.Color.HEX | null);

		/**
		 * Creates a CSS linear gradient
		 */
		static linearGradient(colorStops: globalThis.Array<(Self.Color | Self.Color.HEX | globalThis.Array<(Self.Color | Self.Color.HEX | string)>)>, angleOrDirection?: string): string;

		/**
		 * Creates a CSS radial gradient
		 */
		static radialGradient(colorStops: globalThis.Array<(Self.Color | Self.Color.HEX | globalThis.Array<(Self.Color | Self.Color.HEX | string)>)>, position?: string): string;

		/**
		 * Precision of decimal numbers - 10^(preciseDecimalPoints) = PRECISION
		 */
		static PRECISION: number;

	}

	export namespace Color {
		type Definition = (Self.Color.HEX | Self.Color.RGB | Self.Color.CMYK | Self.Color.HSL | Self.Color.HSV | Self.Color.HWB | Self.Color.GrayscaleObject);

		type HEX = string;

		interface RGB {
			r: number;

			g: number;

			b: number;

			a?: number;

		}

		interface CMYK {
			c: number;

			m: number;

			y: number;

			k: number;

			a?: number;

		}

		interface HSL {
			h: number;

			s: number;

			l: number;

			a?: number;

		}

		interface HSV {
			h: number;

			s: number;

			v: number;

			a?: number;

		}

		interface HWB {
			h: number;

			w: number;

			b: number;

			a?: number;

		}

		interface Greyscale {
			luminosity: number;

			average: number;

			lightness: number;

		}

		interface HEXObject {
			value: string;

		}

		interface RGBObject {
			object: {r: number; g: number; b: number; a: number};

			red: number;

			green: number;

			blue: number;

			cssString: string;

			cssStringPercent: string;

			cssStringWithAlpha: string;

			cssStringWithAlphaPercent: string;

			array: globalThis.Array<number>;

			arrayPercent: globalThis.Array<number>;

		}

		interface CMYKObject {
			object: {c: number; m: number; y: number; k: number; a: number};

			cyan: number;

			magenta: number;

			yellow: number;

			black: string;

			array: globalThis.Array<number>;

			arrayPercent: globalThis.Array<number>;

		}

		interface HSLObject {
			object: {h: number; s: number; l: number; a: number};

			hue: number;

			saturation: number;

			lightness: number;

			cssString: string;

			cssStringWithAlpha: string;

			array: globalThis.Array<number>;

			arrayPercent: globalThis.Array<number>;

		}

		interface HSVObject {
			object: {h: number; s: number; v: number; a: number};

			hue: number;

			saturation: number;

			value: number;

			array: globalThis.Array<number>;

			arrayPercent: globalThis.Array<number>;

		}

		interface HWBObject {
			object: {h: number; w: number; b: number; a: number};

			hue: number;

			whiteness: number;

			blackness: number;

			cssString: string;

			cssStringWithAlpha: string;

			array: globalThis.Array<number>;

			arrayPercent: globalThis.Array<number>;

		}

		interface GrayscaleObject {
			average: number;

			luminosity: number;

			lightness: number;

			cssStringAverage: string;

			cssStringLuminosity: string;

			cssStringLightness: string;

		}

		/**
		 * Color model
		 */
		enum Model {
			HEX,
			RGB,
			CMYK,
			HSL,
			HSV,
			HWB,
		}

		/**
		 * Hex color palette
		 */
		enum Palette {
			Basic,
			Rgb,
			Cmy,
		}

		/**
		 * Color Types
		 */
		enum Type {
			ByteColorChannel,
			FloatColorChannel,
			DegreesColorChannel,
			Instance,
			Hex,
			Value,
		}

		/**
		 * Standard colors instances
		 */
		enum Standard {
			BLACK,
			SILVER,
			GRAY,
			WHITE,
			MAROON,
			RED,
			PURPLE,
			FUCHSIA,
			GREEN,
			LIME,
			OLIVE,
			YELLOW,
			NAVY,
			BLUE,
			TEAL,
			AQUA,
			CYAN,
			MAGENTA,
		}

	}

	/**
	 * Comparator utilities
	 */
	export namespace Comparator {
		interface Direction {
			propertyName: string;

			comparator: Self.Comparator.Function;

		}

		type Function = (left: any, right: any) => number;

		/**
		 * Create a comparator using the standard less than operator. Applicable to strings and numbers.
		 */
		function lessThan(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for strings
		 */
		function string(ascending?: boolean, nullFirst?: boolean, caseSensitive?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for numbers
		 */
		function number(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for date objects
		 */
		function date(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for date time objects
		 */
		function dateTime(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for time objects
		 */
		function time(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator for booleans
		 */
		function boolean(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		/**
		 * Create a comparator that compares a particular property of two objects
		 */
		function ofObjectProperty(propertyName: string, comparator: Self.Comparator.Function): Self.Comparator.Function;

		/**
		 * Create a comparator for multiple object properties
		 */
		function ofObjectProperties(directions: globalThis.Array<Self.Comparator.Direction>): Self.Comparator.Function;

	}

	/**
	 * Components are the basic building block of the entire framework. They are encapsulating and providing the functionality of specific UI objects such as controls or containers. To build a page using components you construct the corresponding component and attach it to the page or include it in a container such as StackPanel or TabPanel. This creates a hierarchical structure of components modelling your page.
	 * Interaction with components is done through their API - properties, methods, events and callbacks. This API is designed to work regardless of whether the components is attached to the page or not. The HTML and CSS produced by the component are considered implementation detail that should not be relied upon.
	 * Component also brings basic lifecycle such as render, erase and dispose. The lifecycle is driven mainly by its presence in the page. Components that are not visible to the user (i.e., are detached or hidden) do not need to maintain their DOM representation and can therefore greatly save resources and improve performance. Render is invoked when component or its parent component is attached to the main page and becomes visible for the user. Its main goal is to provide the HTML reflecting the internal state of the component. Erase happens when component is detached or becomes hidden. Disposal process is there to clean all managed resources. Once the component is disposed, it's unsafe to call any operation on it and all references to its instance should be invalidated. When using a component, you can listen to the lifecycle phases using the appropriate events.
	 * To implement a component you need to override the _onRender method and produce the DOM representation. Component can then respond to DOM events by overriding the appropriate methods and can alter its underlying DOM. Component should never modify any DOM which does not belong to its root element and which was not created by component's logic.
	 */
	export abstract class Component implements Self.MessageHandler, Self.EventSource, Self.PropertyObservable {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Use this method to attach listeners to property changes
		 */
		onPropertyChanged(propertyName?: string, callback?: (args: Self.PropertyObservable.EventArgs, sender: any) => void): any;

		/**
		 * Use this method to fire propertyChanged event
		 */
		protected _notifyPropertyChanged(propertyName: string, oldValue: any, newValue: any, reason?: (string | null)): void;

		/**
		 * Constructor
		 */
		protected constructor(options?: Self.Component.Options);

		/**
		 * Automation id. This id can be set by the user of the component in the constructor and appears in the data-automation-id attribute on the root element. It is not directly used by the framework and does not have to be globally unique.
		 */
		automationId: (string | null);

		/**
		 * Globally unique component id. This is a generated id that is guaranteed to be unique. This id is used as the id attribute on the root element of the component.
		 */
		guid: string;

		/**
		 * The parent component
		 */
		parentComponent: (Self.Component | null);

		/**
		 * The set of child components. This set is empty for components that are not rendered.
		 */
		childComponents: globalThis.Set<Self.Component>;

		/**
		 * The internationalization context. Available only for rendering/rendered components.
		 */
		i18n: (Self.I18n | null);

		/**
		 * True for right-to-left contexts. Value is available only for rendered/rendering components.
		 */
		rtl: (boolean | null);

		/**
		 * Component context, only available for rendered components
		 */
		context: object;

		/**
		 * Dynamic component styles, only available for rendered components
		 */
		style: object;

		/**
		 * Returns true in case that component is being initialized
		 */
		initializing: boolean;

		/**
		 * Returns true in case that component has been initialized
		 */
		initialized: boolean;

		/**
		 * Returns true in case that component is being disposed
		 */
		disposing: boolean;

		/**
		 * Returns true in case that component has been disposed
		 */
		disposed: boolean;

		/**
		 * Get the component size. Works only when the component is rendered
		 */
		computedSize: {width: number; height: number};

		/**
		 * Component visibility
		 */
		visible: boolean;

		/**
		 * Checks whether component is being attached
		 */
		attaching: boolean;

		/**
		 * Checks whether component is being detached
		 */
		detaching: boolean;

		/**
		 * Returns the current visual style
		 */
		visualStyle: any;

		/**
		 * Checks whether component is rendered
		 */
		rendered: boolean;

		/**
		 * Checks whether the component is currently being rendered
		 */
		rendering: boolean;

		/**
		 * Checks whether the component is currently being erased
		 */
		erasing: boolean;

		/**
		 * Returns root HTMLElement associated with this component. This works only if HTMLElement has already been created during attachment phase while calling {@link Component.attachTo}.
		 */
		rootElement: (HTMLElement | null);

		/**
		 * Root element attributes
		 */
		rootAttributes: Self.HtmlAttributeList;

		/**
		 * Root element inline style
		 */
		rootStyle: Self.HtmlStyleList;

		/**
		 * Css class list manager
		 */
		classList: Self.HtmlClassList;

		/**
		 * Enables/disables all user interactions with this component. All programmatic access won't be affected by this. User won't be able to interact with disabled component.
		 */
		enabled: boolean;

		/**
		 * Checks whether component can be operated using normal user interactions. Component is effectively enabled when {@link Component.enabled} is true and {@link Component.enabled} of all of its parents is true. This value thus represents actual availability of user interactions on this component.
		 */
		effectiveEnabled: boolean;

		/**
		 * Component validity. This property is just a shorthand for status property. Component is valid if status is different from ERROR. For PENDING status the property returns null.
		 */
		valid: (boolean | null);

		/**
		 * Component status
		 */
		status: Self.Component.Status;

		/**
		 * Status message
		 */
		statusMessage: (string | Self.Translation | Self.Component | Self.JSX.Element | null);

		/**
		 * True if the component is focusable
		 */
		effectiveFocusable: boolean;

		/**
		 * True if the component can be focusable
		 */
		focusable: boolean;

		/**
		 * True if the component is accessible by the TAB key
		 */
		effectiveTabbable: boolean;

		/**
		 * True if the component can be accessible by the TAB key
		 */
		tabbable: boolean;

		/**
		 * Checks whether this component has focus.
		 */
		focused: boolean;

		/**
		 * Checks whether this component is active. Component is active if it or one of its children is focused. Active component is component that has some visual flag that notifies user that this component is somehow operating right now (like handling nested messages for its child components).
		 */
		active: boolean;

		/**
		 * Loader for the component
		 */
		loader: PackageComponent.Loader;

		/**
		 * Toggle loader visibility
		 */
		loaderVisible: boolean;

		/**
		 * Tooltip
		 */
		tooltip: (PackageComponent.Tooltip | null);

		/**
		 * Drag source
		 */
		dragSource: (Self.DataExchange.DragSourceProvider | null);

		/**
		 * Drag target
		 */
		dragTarget: (Self.DataExchange.DragTargetProvider | null);

		/**
		 * Reference to label component
		 */
		labelledBy: (Self.Component | Self.VDomRef | string | number | null);

		/**
		 * Reference to description component
		 */
		describedBy: (Self.Component | Self.VDomRef | string | number | null);

		/**
		 * Accessibility label
		 */
		ariaLabel: (string | Self.Translation | null);

		/**
		 * Focus handler
		 */
		focusHandler: Self.FocusHandler;

		/**
		 * Context provider
		 */
		contextProvider: (context: object) => object;

		/**
		 * Initializes component. If component is already initialized then no further initialization is performed. Initialization is performed only once during component's lifecycle. If not invoked explicitly the initialization happens just before the first render.
		 * @deprecated
		 */
		initialize(): void;

		/**
		 * Disposes component ending its life.
		 * Once component is disposed it's unsafe to call any method on it. All references to this instance should be invalidated.
		 * @deprecated
		 */
		dispose(): void;

		/**
		 * Check if the component contains another component
		 */
		containsComponent(component: Self.Component, portal?: boolean): void;

		/**
		 * Find parent component matching a predicate
		 */
		findParentComponent(predicate: (parent: Self.Component) => boolean, context?: Self.Component): (Self.Component | null);

		/**
		 * Returns the portal containing this component
		 */
		getPortal(): void;

		/**
		 * Visit child components. Does not visit portals.
		 */
		visitComponents(callback: (component: Self.Component) => (boolean | null), options?: {type?: Self.Component.TraversalType}): void;

		/**
		 * Attaches component to DOM element represented by parent parameter.
		 * If component has already been attached to DOM element then this instance will be first detached and then reattached to another DOM element. User can specify how the component is attached to DOM by specifying mode in options.
		 * @deprecated Use virtual DOM
		 */
		attachTo(parentOrSelector: (HTMLElement | string), options?: {mode?: Self.Component.AttachMode; element?: Element; index?: number; parentComponent?: Self.Component}): Self.Component;

		/**
		 * Removes component from parent DOM element to which it has been previously attached. Calling this function will remove all HTMLElement nodes from DOM that are managed by this component. This does not have any effect if component has not been attached to DOM yet.
		 * Component can be safely reattached to DOM once it's been detached by {@link Component.attachTo}
		 * @deprecated Use virtual DOM
		 */
		detach(): void;

		/**
		 * Returns the list of registered message pre-filters for a given message
		 */
		protected _getMessagePreFilters(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		/**
		 * Returns the list of registered message post-filters for a given message
		 */
		protected _getMessagePostFilters(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		/**
		 * Processes DOM and other messages
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Check if the component DOM contains an element
		 */
		containsElement(element: HTMLElement, options?: {isOwnElement?: boolean}): boolean;

		/**
		 * Computes component size. Can be safely called only for rendered components.
		 */
		computeSize(includeMargin: boolean): {width: number; height: number};

		/**
		 * Makes this component visible
		 */
		show(): void;

		/**
		 * Hides this component making it invisible
		 */
		hide(): void;

		/**
		 * Sets focus to this component.
		 */
		focus(): void;

		/**
		 * Sets visibility
		 */
		setVisible(visible: boolean, options?: {reason?: string}): void;

		/**
		 * Sets enabled
		 */
		setEnabled(enabled: boolean, options?: {reason?: string}): void;

		/**
		 * Sets valid
		 */
		setValid(value: boolean, options?: {message?: (string | Self.Translation | Self.Component | Self.JSX.Element); reason?: string}): void;

		/**
		 * Set component status. Clears the statusMessage property if no new message is specified.
		 */
		setStatus(status: Self.Component.Status, options?: {message?: (string | Self.Translation | Self.Component | Self.JSX.Element); reason?: string; silent?: boolean}): void;

		/**
		 * Change status message that is shown in a tooltip on the status icon or the cell
		 */
		setStatusMessage(message: (string | Self.Translation | Self.Component | Self.JSX.Element | null), options?: {reason?: (string | null); silent?: boolean}): void;

		/**
		 * Sets loader visibility
		 */
		setLoaderVisible(visible: boolean): void;

		/**
		 * Toggle focusability of the component
		 */
		setFocusable(value: boolean): void;

		/**
		 * Toggle tabbability of the component
		 */
		setTabbable(value: boolean): void;

		/**
		 * Change the visual style of the component
		 */
		setVisualStyle(style: any): void;

		/**
		 * Sets tooltip
		 */
		setTooltip(tooltip: (PackageComponent.Tooltip | null)): void;

		/**
		 * Set automation id
		 */
		setAutomationId(value: (string | null)): void;

		/**
		 * Set drag source
		 */
		setDragSource(source: (Self.DataExchange.DragSourceProvider | null)): void;

		/**
		 * Set drag target
		 */
		setDragTarget(target: (Self.DataExchange.DragTargetProvider | null)): void;

		/**
		 * Set label component or id
		 */
		setLabelledBy(value: (Self.Component | Self.VDomRef | string | number | null)): void;

		/**
		 * Set description component or id
		 */
		setDescribedBy(value: (Self.Component | Self.VDomRef | string | number | null)): void;

		/**
		 * Set accessibility label
		 */
		setAriaLabel(value: (string | null)): void;

		/**
		 * Registers a message filter for the component
		 */
		addMessageFilter(filter: (Self.RoutedMessage.Filter | Record<string, Self.RoutedMessage.Handler>)): {remove: () => void};

		/**
		 * Removes message filter previously registered using Component#addMessageFilter
		 */
		removeMessageFilter(filter: Self.RoutedMessage.Filter): void;

		/**
		 * Get the automationId of the class
		 */
		getClassAutomationId(): (string | null);

		/**
		 * Force all components in the tree to flush any pending layout changes
		 */
		forceLayout(): void;

		/**
		 * Utility method that accepts either a string or a translation and returns a string.
		 */
		translate(value: (string | number | Self.Translation)): string;

		/**
		 * Apply prop updates during VDom reconciliation
		 */
		private _receiveProps(oldProps: object, newProps: object): void;

		/**
		 * Perform an action after component is rendered or do it immediately if it is rendered already
		 */
		whenRendered(action: () => void): Self.EventSource.Handle;

		/**
		 * Checks if property value has changed and if it has the correct type, writes the value to the backing field and calls _refresh.
		 */
		protected _setProp(name: string, value: any, comparator?: (left: any, right: any) => boolean): boolean;

		/**
		 * Checks if private property value has changed and if the new value has correct type. If yes, calls the setter and refreshes the component.
		 */
		protected _setPrivateProp(props: object, name: string, value: any, comparator?: (left: any, right: any) => boolean): void;

		/**
		 * Set multiple property values
		 */
		protected _setProps(props: object): void;

		/**
		 * Validate property value using propTypes
		 */
		protected _validateProp(name: string, value: any): void;

		/**
		 * Call this method to let your parent components know that your content has changed. Windows listen for these changes and update their size.
		 */
		protected _notifyContentUpdate(): void;

		/**
		 * Add a child component
		 */
		private _addChildComponent(component: Self.Component): void;

		/**
		 * Removes child component
		 */
		private _removeChildComponent(component: Self.Component): void;

		/**
		 * Re-render the component. Intended only for internal use by Component and its sub-classes.
		 */
		protected _refresh(): void;

		/**
		 * Execute logic after component render
		 */
		private _handleDidRender(): void;

		/**
		 * Execute logic before component erase
		 */
		private _handleWillErase(): void;

		/**
		 * Hooks resize listener
		 */
		private _hookResizeListener(): void;

		/**
		 * Unhooks resize listener
		 */
		private _unhookResizeListener(): void;

		/**
		 * Calculates the effective enabled flag based on the enabled state of this component and its parents
		 */
		private _updateEffectiveEnabled(reason?: string): void;

		/**
		 * Remove the focus if this component is active while becoming detached or hidden
		 */
		private _removeFocus(): void;

		/**
		 * Handle resize event
		 */
		private _handleResizeEvent(args: Self.ResizeObserver.ResizeArgs): void;

		/**
		 * Update the automationId attribute
		 */
		private _updateAutomationId(): void;

		/**
		 * Update the aria-labelledby attribute
		 */
		private _updateAriaLabelledBy(): void;

		/**
		 * Get the value of the labelled by attribute
		 */
		protected _getAriaLabelledBy(): (Self.Component | Self.VDomRef | string | number | null);

		/**
		 * Update the aria-describedby attribute
		 */
		private _updateAriaDescribedBy(): void;

		/**
		 * Attach drag source and target
		 */
		private _attachDragSourceAndTarget(rootElement: HTMLElement): void;

		/**
		 * Detach drag srouce and target
		 */
		private _detachDragSourceAndTarget(rootElement: HTMLElement): void;

		/**
		 * Update the aria label attribute
		 */
		protected _updateAriaLabel(): void;

		/**
		 * Update component validity based on the status property
		 */
		private _updateValidity(previousStatus: Self.Component.Status, status: Self.Component.Status, reason: (string | null)): void;

		/**
		 * Get the aria label for this component
		 */
		protected _getAriaLabel(): (string | null);

		/**
		 * Change the focus handler
		 */
		protected _setFocusHandler(handler: Self.FocusHandler): void;

		/**
		 * Returns the element which obtains focus on FOCUS IN message.
		 */
		protected _getFocusElement(): HTMLElement;

		/**
		 * Get the element that should receive the aria-labelledby and aria-describedby attributes
		 */
		protected _getAriaElement(): HTMLElement;

		/**
		 * Method to be overridden in descendants which need to handle special cases when the component is disabled, but wants the event to be passed for processing. One example is allowing resizing of disabled TextArea.
		 */
		protected _bypassMessageOnDisabledComponent(message: Self.RoutedMessage): boolean;

		/**
		 * Called when component is focused
		 */
		protected _onFocusIn(args: {element: HTMLElement; component: Self.Component}): void;

		/**
		 * Called when component loses focus
		 */
		protected _onFocusOut(args: {nextFocusedElement: (Element | null); nextFocusedComponent: (Self.Component | null); focusedComponent: Self.Component}): void;

		/**
		 * Called when focus moves inside the component
		 */
		protected _onFocusMoved(args: {element: HTMLElement; component: Self.Component}): void;

		/**
		 * Called when component is activated
		 */
		protected _onActivated(args: {element: HTMLElement; component: Self.Component}): void;

		/**
		 * Called when component is deactivated
		 */
		protected _onDeactivated(args: {nextFocusedElement: (Element | null); nextFocusedComponent: (Self.Component | null); focusedComponent: Self.Component}): void;

		/**
		 * Override to handle mouse click message in capture phase
		 */
		protected _onCaptureClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle mouse double click message in capture phase
		 */
		protected _onCaptureDoubleClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle wheel message in capture phase
		 */
		protected _onCaptureWheel(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer move message in capture phase
		 */
		protected _onCapturePointerMove(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer leave message in capture phase
		 */
		protected _onCapturePointerLeave(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer enter message in capture phase
		 */
		protected _onCapturePointerEnter(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer over message in capture phase
		 */
		protected _onCapturePointerOver(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer out message in capture phase
		 */
		protected _onCapturePointerOut(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer up message in capture phase
		 */
		protected _onCapturePointerUp(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer down message in capture phase
		 */
		protected _onCapturePointerDown(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key down message in capture phase
		 */
		protected _onCaptureKeyDown(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key up message in capture phase
		 */
		protected _onCaptureKeyUp(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key press message in capture phase
		 */
		protected _onCaptureKeyPress(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key down message in bubble up phase
		 */
		protected _onKeyDown(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key up message in bubble up phase
		 */
		protected _onKeyUp(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle key press message in bubble up phase
		 */
		protected _onKeyPress(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle mouse click message in bubble up phase
		 */
		protected _onClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle mouse double click message in bubble up phase
		 */
		protected _onDoubleClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer leave message in bubble up phase
		 */
		protected _onPointerLeave(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer enter message in bubble up phase
		 */
		protected _onPointerEnter(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer move message in bubble up phase
		 */
		protected _onPointerMove(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer up message in bubble up phase
		 */
		protected _onPointerUp(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer down message in bubble up phase
		 */
		protected _onPointerDown(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer over message in bubble up phase
		 */
		protected _onPointerOver(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle pointer out message in bubble up phase
		 */
		protected _onPointerOut(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle mouse wheel message in bubble up phase
		 */
		protected _onWheel(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle scroll message in bubble up phase
		 */
		protected _onScroll(message: Self.ViewMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle paste message in bubble up phase
		 */
		protected _onPaste(message: Self.ClipboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle cut message in bubble up phase
		 */
		protected _onCut(message: Self.ClipboardMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle select message in bubble up phase
		 */
		protected _onSelect(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Override to handle input message in bubble up phase
		 */
		protected _onInput(message: Self.ValueChangeMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Handle context menu message
		 */
		protected _onContextMenu(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Called before the component is rendered for the first time.
		 * @deprecated
		 */
		protected _onInitialize(): void;

		/**
		 * Called when component should dispose itself. This method should contain all the dispose logic.
		 * @deprecated
		 */
		protected _onDispose(): void;

		/**
		 * Called once the component is added to active page. This method should return the DOM for this component.
		 */
		protected _onRender(context: object, css: object): (HTMLElement | Self.JSX.Element | Self.Component);

		/**
		 * Called once component has been fully rendered.
		 */
		protected _onAfterRender(context: object): void;

		/**
		 * Called for components using virtual dom after the dom has been updated.
		 */
		protected _onAfterUpdate(context: object): void;

		/**
		 * Called before component erases it's content.
		 */
		protected _onBeforeErase(context: object): void;

		/**
		 * Called when component is removed from the page or becomes hidden. By default the component DOM is thrown away but you may perform additional cleanup logic in this method such as releasing any references to the DOM elements.
		 * @deprecated
		 */
		protected _onErase(context: object): void;

		/**
		 * Called when component should update its layout
		 */
		protected _onLayout(): void;

		/**
		 * Called on visible changes
		 */
		protected _onVisibleChanged(args: object): void;

		/**
		 * Called on visualStyle changes
		 */
		protected _onVisualStyleChanged(args: object): void;

		/**
		 * Called when component is resized
		 */
		protected _onResize(args: Self.Component.ResizeArgs): void;

		/**
		 * Override to handle enabled flag change
		 */
		protected _onEnabledChanged(args: {enabled: boolean; previousEnabled: boolean; reason?: string}): void;

		/**
		 * Override to handle effective enabled flag change
		 */
		protected _onEffectiveEnabledChanged(args: {effectiveEnabled: boolean; previousEffectiveEnabled: boolean; reason?: string}): void;

		/**
		 * Override to handle validity change
		 */
		protected _onValidityChanged(args: {valid: boolean; previousValid: boolean; reason?: string}): void;

		/**
		 * Override to handle content updates
		 */
		protected _onContentUpdated(args: {component: Self.Component}): boolean;

		/**
		 * Override to handle status changes
		 */
		protected _onStatusChanged(args: {status: Self.Component.Status; previousStatus: Self.Component.Status; reason?: string}): void;

		/**
		 * Override to handle status message changes
		 */
		protected _onStatusMessageChanged(args: {message: (string | Self.Translation | Self.Component); previousMessage: (string | Self.Translation | Self.Component); reason?: string}): void;

		protected _onContentMeasurementStarted(): void;

		protected _onContentMeasurementFinalized(): void;

		/**
		 * Provide additional context for self and child components
		 */
		protected _onProvideContext(context: object): object;

		/**
		 * Override to manually handle prop update during VDom reconciliation. By default property setter is called.
		 */
		protected _onReceiveProp(name: string, oldValue: any, newValue: any): void;

		/**
		 * Override to handle what should happen when a property is unset in virtual DOM
		 */
		protected _onUnsetProp(key: string): any;

		/**
		 * Return true to force component virtual DOM refresh
		 */
		protected _onShouldUpdate(): void;

		static Event: Self.Component.EventTypes;

		/**
		 * Locates nearest component which encapsulates given HTMLElement
		 */
		static findByElement(element: Element, context?: Element): (Self.Component | null);

		/**
		 * Creates a pseudo Component around a DOM element. Can be used as an owner of windows in legacy where no other owner is available or as a component for tooltip.
		 */
		static wrapElement(element: Element, host: PackageComponent.Host): Self.ElementComponent;

		/**
		 * Find a Host based on a component
		 */
		static getHostByComponent(component: (Self.Component | Self.ElementComponent)): (PackageComponent.Host | null);

		/**
		 * Prepare component props. Merges defaultProps into options and checks types using propTypes.
		 */
		static props(Class: (options: any) => any, options: object, deepExtend?: boolean): object;

		/**
		 * Available contexts for rendering
		 */
		static contextTypes: globalThis.Array<string>;

		/**
		 * Checks if object is an instance of Component
		 */
		static is(value: any): void;

	}

	export namespace Component {
		interface Options {
			ariaLabel?: (string | Self.Translation);

			automationId?: string;

			classList?: Self.HtmlClassList.ClassList;

			describedBy?: (Self.Component | Self.VDomRef | number | string);

			dragSource?: Self.DataExchange.DragSourceProvider;

			dragTarget?: Self.DataExchange.DragTargetProvider;

			enabled?: boolean;

			focusable?: boolean;

			labelledBy?: (Self.Component | Self.VDomRef | number | string);

			messageFilter?: (Self.RoutedMessage.Filter | Record<string, Self.RoutedMessage.Handler>);

			observeSize?: boolean;

			rootAttributes?: Record<string, string>;

			rootStyle?: Record<string, string>;

			status?: Self.Component.Status;

			statusMessage?: (string | Self.Translation | Self.Component | Self.JSX.Element);

			tabbable?: boolean;

			tooltip?: PackageComponent.Tooltip;

			valid?: boolean;

			visible?: boolean;

			visualStyle?: any;

			loader?: PackageComponent.Loader.Options;

			contextProvider?: (context: object) => object;

			on?: Self.EventSource.ListenerMap;

			ref?: Self.VDomRef;

			key?: any;

		}

		interface EventTypes {
			INITIALIZED: string;

			WILL_DISPOSE: string;

			DISPOSED: string;

			RENDERED: string;

			WILL_ERASE: string;

			FOCUS_IN: string;

			FOCUS_OUT: string;

			FOCUS_MOVED: string;

			ACTIVATED: string;

			DEACTIVATED: string;

			ENABLED: string;

			EFFECTIVE_ENABLED_CHANGED: string;

			VALIDITY_CHANGED: string;

			STATUS_CHANGED: string;

			STATUS_MESSAGE_CHANGED: string;

			RESIZED: string;

			POINTER_ENTER: string;

			POINTER_LEAVE: string;

			VISIBILITY_CHANGED: string;

		}

		interface ResizeArgs {
			size: Self.ResizeObserver.Size;

			previousSize: Self.ResizeObserver.Size;

			deltaWidth: number;

			deltaHeight: number;

		}

		enum AttachMode {
			APPEND,
			PREPEND,
			BEFORE,
			INDEX,
		}

		enum Status {
			NONE,
			SUCCESS,
			INFO,
			WARNING,
			ERROR,
			PENDING,
		}

		enum StateStyle {
			ACTIVE,
			FOCUSED,
			DISABLED,
			SUSPENDED,
		}

		enum TraversalType {
			PREORDER,
			POSTORDER,
		}

	}

	/**
	 * Component focus handler
	 */
	class ComponentFocusHandler {
		/**
		 * Constructs ComponentFocusHandler
		 */
		constructor(args: {focusable?: boolean; tabbable?: boolean; component?: Self.Component});

		/**
		 * True if the component is focusable
		 */
		effectiveFocusable: boolean;

		/**
		 * True if the component can be focusable
		 */
		focusable: boolean;

		/**
		 * True if the component is tabbable
		 */
		effectiveTabbable: boolean;

		/**
		 * True if the component can be tabbable
		 */
		tabbable: boolean;

		/**
		 * Current focus target component
		 */
		focusComponent: Self.Component;

		/**
		 * Updates
		 */
		update(): void;

		/**
		 * Focuses
		 */
		focus(): boolean;

		/**
		 * Check if focused
		 */
		isFocused(focusComponent: Self.Component): boolean;

		/**
		 * Creates new ComponentFocusHandler
		 */
		static factory(args: object): Self.ComponentFocusHandler;

	}

	namespace ComponentFocusHandler {
	}

	/**
	 * Computed translation
	 */
	class ComputedTranslation extends Self.Translation {
		/**
		 * Constructor
		 */
		constructor(callback: (i18n: Self.I18n) => string);

	}

	namespace ComputedTranslation {
	}

	/**
	 * Context
	 */
	export class Context implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs Context
		 */
		constructor(options?: Self.Context.Options);

		/**
		 * Get parent context
		 */
		parent: (Self.Context | null);

		/**
		 * Context name
		 */
		name: string;

		/**
		 * Child contexts
		 */
		children: globalThis.Array<Self.Context>;

		/**
		 * Root context
		 */
		root: Self.Context;

		/**
		 * Service map
		 */
		services: Self.HierarchicalMap;

		/**
		 * Current state
		 */
		state: object;

		/**
		 * Route with parameters
		 */
		routeState: Self.Route.State;

		/**
		 * True if the context has been disposed
		 */
		disposed: boolean;

		/**
		 * Create child context
		 */
		createChild(options?: Self.Context.Options): Self.Context;

		/**
		 * Manually change context state
		 */
		setState(state: object): void;

		/**
		 * Subscribe to event
		 */
		subscribe(topic: string, handler: (args: object) => void): {remove: () => void};

		/**
		 * Publish event
		 */
		publish(topic: string, args?: object, options?: {mode?: Self.Context.EventMode}): void;

		/**
		 * Dispatch store action. When action is string or two parameters are used then action object {type: action, payload: payload} is created
		 */
		dispatchAction(action: (Self.Reducer.Action | string), payload?: any): void;

		/**
		 * Activate a new route.
		 */
		routeTo(route: Self.Route, parameters?: object, modifiers?: {replace?: boolean}): void;

		/**
		 * Manually change the route object.
		 */
		setRoute(routeState: Self.Route.State): void;

		/**
		 * Returns true if this context is child of given parent context
		 */
		isChildOf(parent: Self.Context): boolean;

		/**
		 * Disposes the context
		 */
		dispose(): void;

		/**
		 * Get the full list of services
		 */
		getServices(): void;

		/**
		 * The default state provider copies the parentState to currentState
		 */
		static defaultStateProvider(parentState: any, currentState: any): any;

		static Event: Self.Context.EventTypes;

	}

	export namespace Context {
		interface Options {
			parent?: Self.Context;

			rooted?: boolean;

			name?: string;

			state?: object;

			stateProvider?: Self.Context.StateProviderCallback;

			actionDispatch?: (action: any) => void;

			actionDecorator?: (action: any) => any;

			routeTo?: (route: Self.Route, parameters: object, modifiers: object) => void;

			routeState?: Self.Route.State;

			on?: Self.EventSource.ListenerMap;

		}

		type StateProviderCallback = (parentState: any, childState: any) => any;

		interface EventTypes {
			STATE_CHANGED: string;

			ROUTE_CHANGED: string;

			ACTION_DISPATCHED: string;

			DISPOSED: string;

		}

		/**
		 * Event mode types. - Broadcast - event is handled by all handlers. - All - if scope doesn't have root scope, behavior is same as it is in 'broadcast' mode. - if scope is rooted (has root scope specified), event is handled by all handlers under this root scope. - Local - event is handled only by the sender scope handlers. - Scope - event is handled by the sender scope handlers and all child handlers.
		 */
		enum EventMode {
			ALL,
			BROADCAST,
			LOCAL,
			SCOPE,
		}

	}

	/**
	 * Context types
	 */
	export class ContextType {
		static DEVICE_METADATA: string;

		static DISPATCHER: string;

		static FOCUS_MANAGER: string;

		static HELP: string;

		static HELP_CENTER: string;

		static I18N: string;

		static MESSAGING: string;

		static PERFORMANCE: string;

		static PREFERENCES: string;

		static ROUTER: string;

		static ROUTER_NAVIGATION: string;

		static ROUTER_LOCATION: string;

		static ROUTER_ROUTE: string;

		static SCROLL_OBSERVER: string;

		static SHORTCUTS: string;

		static WINDOW_MANAGER: string;

		static THEME: string;

		static THEME_BACKGROUND: string;

		static DEBUG: string;

		static FORMAT: string;

		static APP: string;

		static FORM: string;

		static LOGGING: string;

		static DISPATCH: string;

		static STORE: string;

		static WINDOW: string;

		/**
		 * Create a new context type
		 */
		static new(name: string): string;

	}

	export namespace ContextType {
	}

	/**
	 * Cookie helper functions
	 */
	namespace Cookies {
		/**
		 * Get cookie
		 */
		function get(key: string): string;

		/**
		 * Set cookie
		 */
		function set(key: string, value: string, options: object): void;

		/**
		 * Expire cookie
		 */
		function expire(key: string, options: object): void;

	}

	/**
	 * Counter
	 */
	export class Counter {
		/**
		 * Constructor
		 */
		constructor(first?: number, increment?: number);

		/**
		 * Get next value
		 */
		next(): number;

	}

	export namespace Counter {
	}

	export namespace DataExchange {
		interface DragSource {
			onProvideSourceData: (args: Self.DataExchange.ProvideSourceDataArgs) => any;

			onInitializeGhost?: (args: Self.DataExchange.InitializeGhostArgs) => void;

			onBegin?: (args: Self.DataExchange.BeginArgs) => void;

			onTargetSubscribed?: (args: Self.DataExchange.SubscribeArgs) => void;

			onTargetUnsubscribed?: (args: Self.DataExchange.SubscribeArgs) => void;

			onEnd?: (args: Self.DataExchange.EndArgs) => void;

			onCancel: (args: Self.DataExchange.EndArgs) => void;

			onCommit: (args: Self.DataExchange.CommitArgs) => void;

		}

		interface DragTarget {
			onProvideTargetData: (args: Self.DataExchange.ProvideTargetDataArgs) => any;

			onCompareData?: (left: any, right: any) => boolean;

			onSubscribe?: (args: Self.DataExchange.SubscribeArgs) => void;

			onUnsubscribe?: (args: Self.DataExchange.SubscribeArgs) => void;

			onCommit: (args: Self.DataExchange.CommitArgs) => void;

		}

		type DragSourceProvider = (args: Self.DataExchange.DragSourceProviderArgs) => Self.DataExchange.DragSource;

		interface DragSourceProviderArgs {
			cursorElement: Element;

			cursorComponent: Self.Component;

			cursorPosition: Self.PointerMessage.Position;

			sourceElement: Element;

			sourceComponent: Self.Component;

		}

		type DragTargetProvider = (args: Self.DataExchange.DragTargetProviderArgs) => Self.DataExchange.DragTarget;

		interface DragTargetProviderArgs {
			source: any;

			sourceComponent: Self.Component;

			targetComponent: Self.Component;

		}

		interface ProvideSourceDataArgs {
			cursorElement: Element;

			cursorComponent: Self.Component;

			cursorPosition: Self.PointerMessage.Position;

			sourceElement: Element;

			sourceComponent: Self.Component;

		}

		interface InitializeGhostArgs {
			source: any;

			cursorPosition: Self.PointerMessage.Position;

			sourceElement: Element;

			sourceComponent: Self.Component;

			ghost: Self.DragDropGhost;

		}

		interface BeginArgs {
			source: any;

			sourceComponent: Self.Component;

			ghost: Self.DragDropGhost;

		}

		interface SubscribeArgs {
			source: any;

			sourceComponent: Self.Component;

			target: any;

			targetComponent: Self.Component;

			ghost: Self.DragDropGhost;

		}

		interface EndArgs {
			source: any;

			sourceComponent: Self.Component;

		}

		interface CommitArgs {
			source: any;

			sourceComponent: Self.Component;

			target: any;

			targetComponent: Self.Component;

		}

		interface ProvideTargetDataArgs {
			source: any;

			sourceComponent: Self.Component;

			targetComponent: Self.Component;

			cursorElement: Element;

			cursorPosition: Self.PointerMessage.Position;

			cursorComponent: Self.Component;

		}

		interface SourceDecorator {
			onDecorate: (args: Self.DataExchange.BeginArgs) => void;

			onUndecorate: (args: Self.DataExchange.EndArgs) => void;

		}

		interface TargetDecorator {
			onDecorate: (args: Self.DataExchange.SubscribeArgs) => void;

			onUndecorate: (args: Self.DataExchange.SubscribeArgs) => void;

		}

		/**
		 * Build basic drag source
		 */
		function buildDragSource(options: {onProvideSourceData: (args: Self.DataExchange.ProvideSourceDataArgs) => any; decorator?: (args: Self.DataExchange.DragSourceProviderArgs) => Self.DataExchange.SourceDecorator; targetDecorator?: (args: Self.DataExchange.DragSourceProviderArgs) => Self.DataExchange.TargetDecorator; onInitializeGhost?: (args: Self.DataExchange.InitializeGhostArgs) => void; onCancel?: (args: Self.DataExchange.EndArgs) => void; onCommit?: (args: Self.DataExchange.CommitArgs) => void}): Self.DataExchange.DragSourceProvider;

		/**
		 * Build basic drag target
		 */
		function buildDragTarget(options: {same?: boolean; onValidateExchange?: (args: Self.DataExchange.DragTargetProviderArgs) => boolean; onProvideTargetData: (args: Self.DataExchange.ProvideTargetDataArgs) => any; onCompareData: (left: any, right: any) => boolean; onCommit: (args: Self.DataExchange.CommitArgs) => void; decorator?: (args: Self.DataExchange.DragTargetProviderArgs) => Self.DataExchange.TargetDecorator}): Self.DataExchange.DragTargetProvider;

	}

	export class DataExchangeManager implements Self.MessageHandler {
		/**
		 * Constructs DataExchangeManager
		 */
		constructor();

		/**
		 * Processes message
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: object): void;

	}

	export namespace DataExchangeManager {
	}

	/**
	 * Data source interface
	 */
	export interface DataSource extends Self.EventSource {
		/**
		 * Query data source items
		 */
		query(args: Self.DataSource.QueryArguments, resolve: (args: {items: globalThis.Array<any>}) => void, reject?: (error: any) => void): void;

	}

	export namespace DataSource {
		interface QueryArguments {
			item?: any;

			index?: number;

			count?: number;

			cancellationToken?: Self.CancellationToken;

		}

		type QueryCallback = (args: Self.DataSource.QueryArguments, resolve: (args: {items: globalThis.Array<any>}) => void, reject: (error: any) => void) => void;

		interface EventType {
			UPDATED: string;

		}

		/**
		 * This is a shortcut for Type.Implements(DataSource)
		 */
		const Type: Self.Type.Matcher;

		/**
		 * Checks if object is an instance of DataSource
		 */
		function is(value: any): boolean;

		/**
		 * Get a promise to a data source query
		 */
		function queryPromise(dataSource: Self.DataSource, args?: Self.DataSource.QueryArguments): globalThis.Promise<{items: globalThis.Array<any>}>;

		/**
		 * Create a generic data source based on a given query function
		 */
		function create(query: (args: Self.DataSource.QueryArguments, resolve: (args: {items: globalThis.Array<any>}) => void, reject: (error: any) => void) => void): Self.GenericDataSource;

		/**
		 * Loads all data in the data source
		 */
		function queryAll(dataSource: Self.DataSource): globalThis.Promise<globalThis.Array<any>>;

		enum UpdateType {
			ADD,
			REMOVE,
			MOVE,
			RESET,
		}

		const Event: Self.DataSource.EventType;

	}

	/**
	 * Hierarchical data store
	 */
	export class DataStore {
		/**
		 * Constructs DataStore
		 */
		constructor();

		/**
		 * Root of the entry tree
		 */
		rootEntry: Self.DataStoreEntry;

		/**
		 * The associated data source
		 */
		dataSource: (Self.DataSource | null);

		/**
		 * True if the data store is empty
		 */
		empty: boolean;

		/**
		 * Binds the data source
		 */
		bindDataSource(dataSource: Self.DataSource): void;

		/**
		 * Unbinds the data source
		 */
		unbindDataSource(): void;

		/**
		 * Updates the data source
		 */
		update(update: object, args: object): void;

		/**
		 * Get entry for the given data item
		 */
		entryForDataItem(dataItem: any): any;

		/**
		 * Visits all items
		 */
		visit(callback: (entry: Self.DataStoreEntry) => (boolean | null)): void;

		/**
		 * Disposes data source
		 */
		dispose(): void;

	}

	export namespace DataStore {
	}

	/**
	 * Hierarchical data store entry
	 */
	class DataStoreEntry {
	}

	namespace DataStoreEntry {
	}

	/**
	 * UIF Date
	 */
	export class Date {
		/**
		 * Constructor
		 */
		constructor(yearOrDate?: (number | string | globalThis.Date), monthIndex?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number);

		/**
		 * Returns day of week where SUN=0, MON=1, ... SAT=6
		 */
		dayOfWeek: number;

		/**
		 * Gets current day in month
		 */
		day: number;

		/**
		 * Gets current month
		 */
		month: number;

		/**
		 * Gets current year
		 */
		year: number;

		/**
		 * Gets hours
		 */
		hours: number;

		/**
		 * Gets minutes
		 */
		minutes: number;

		/**
		 * Gets seconds
		 */
		seconds: number;

		/**
		 * Gets milliseconds
		 */
		milliseconds: number;

		/**
		 * Gets the number of milliseconds since 1970/01/01
		 */
		millisecondsSinceEpoch: number;

		/**
		 * Gets day in UTC time
		 */
		utcDay: number;

		/**
		 * Gets month in UTC time
		 */
		utcMonth: number;

		/**
		 * Gets year in UTC time
		 */
		utcYear: number;

		/**
		 * Gets hours in UTC time
		 */
		utcHours: number;

		/**
		 * Gets minutes in UTC time
		 */
		utcMinutes: number;

		/**
		 * Gets/Sets the seconds in UTC time
		 */
		utcSeconds: number;

		/**
		 * Gets/Sets milliseconds in UTC time
		 */
		utcMilliseconds: number;

		/**
		 * Checks if is the date is valid
		 */
		isValid(): boolean;

		/**
		 * Removes time supplement from the date
		 */
		stripTime(): Self.Date;

		/**
		 * Removes time and day information from the date
		 */
		stripDayAndTime(): Self.Date;

		/**
		 * Moves n day forward
		 */
		addDay(num: number): Self.Date;

		/**
		 * Moves n weeks forward
		 */
		addWeek(num: number): Self.Date;

		/**
		 * Moves n months forward
		 */
		addMonth(num: number): Self.Date;

		/**
		 * Moves n years forward
		 */
		addYear(num: number): Self.Date;

		/**
		 * Moves n hours forward
		 */
		addHour(num: number): Self.Date;

		/**
		 * Moves n minutes forward
		 */
		addMinute(num: number): Self.Date;

		/**
		 * Moves n seconds forward
		 */
		addSecond(num: number): Self.Date;

		/**
		 * Moves n milliseconds forward
		 */
		addMillisecond(num: number): Self.Date;

		/**
		 * Returns a new date with modified day
		 */
		setDay(day: number): Self.Date;

		/**
		 * Returns a new date with a modified month
		 */
		setMonth(month: number): Self.Date;

		/**
		 * Returns a new date with a modified year
		 */
		setYear(year: number): Self.Date;

		/**
		 * Returns a new date with modified number of hours
		 */
		setHours(hours: number): Self.Date;

		/**
		 * Returns a new date with modified number of minutes
		 */
		setMinutes(minutes: number): Self.Date;

		/**
		 * Returns a new date with modified number of seconds
		 */
		setSeconds(seconds: number): Self.Date;

		/**
		 * Returns a new date with modified number of miliseconds
		 */
		setMilliseconds(milliseconds: number): Self.Date;

		/**
		 * Moves one day forward
		 */
		nextDay(): Self.Date;

		/**
		 * Moves one day back
		 */
		prevDay(): Self.Date;

		/**
		 * Compares this date with another.
		 */
		compare(date: Self.Date, dateOnly?: boolean): number;

		/**
		 * Compares this date with another for equality.
		 */
		equals(date: (Self.Date | null), dateOnly?: boolean): boolean;

		/**
		 * Returns true if this date is before the date in arguments
		 */
		before(date: Self.Date, dateOnly?: boolean): boolean;

		/**
		 * Returns true if this date is before or equal to the date in arguments
		 */
		beforeOrEqual(date: Self.Date, dateOnly?: boolean): boolean;

		/**
		 * Returns true if this date is after the date in arguments
		 */
		after(date: Self.Date, dateOnly?: boolean): boolean;

		/**
		 * Returns true if this date is after or equal to the date in arguments
		 */
		afterOrEqual(date: Self.Date, dateOnly?: boolean): boolean;

		/**
		 * Clones this instance
		 */
		clone(): Self.Date;

		/**
		 * Transforms date into a string
		 */
		toString(): string;

		/**
		 * Sets day in UTC time
		 */
		setUTCDay(day: number): Self.Date;

		/**
		 * Sets month in UTC time
		 */
		setUTCMonth(month: number): Self.Date;

		/**
		 * Gets year in UTC time
		 */
		setUTCYear(year: number): Self.Date;

		/**
		 * Gets hours in UTC time
		 */
		setUTCHours(hours: number): Self.Date;

		/**
		 * Gets minutes in UTC time
		 */
		setUTCMinutes(minutes: number): Self.Date;

		/**
		 * Gets the seconds in UTC time
		 */
		setUTCSeconds(seconds: number): Self.Date;

		/**
		 * Gets milliseconds in UTC time
		 */
		setUTCMilliseconds(milliseconds: number): Self.Date;

		/**
		 * Returns object for JSON serialization
		 */
		toJSON(): string;

		/**
		 * Returns new instance representing this Date as EcmaScript Date
		 */
		toDate(): globalThis.Date;

		/**
		 * Returns date string
		 */
		toDateString(): string;

		/**
		 * Returns ISO date string
		 */
		toISOString(): string;

		/**
		 * Returns date string formatted under current locale
		 */
		toLocaleDateString(): string;

		/**
		 * Returns complete string representation under current locale
		 */
		toLocaleString(): string;

		/**
		 * Returns time string under current locale
		 */
		toLocaleTimeString(): string;

		/**
		 * Returns time string
		 */
		toTimeString(): string;

		/**
		 * Returns UTC time string
		 */
		toUTCString(): string;

		/**
		 * Finds the closest day of week to this date. When forward is true (default value is true), it searches for the closest upcoming day, otherwise it searches backwards for the past day.
		 */
		closestDayOfWeek(dayOfWeek: number, forward?: boolean): Self.Date;

		/**
		 * Returns first day in month
		 */
		firstOfMonth(): Self.Date;

		/**
		 * Returns last day in month
		 */
		lastOfMonth(): Self.Date;

		/**
		 * Gets the number of the week
		 */
		weekNumber(): number;

		/**
		 * Creates a Date object from native JS date. If the date is null returns null.
		 */
		static fromDate(date: (globalThis.Date | null)): (Self.Date | null);

		/**
		 * Creates a Date object from unix timestamp
		 */
		static fromTimeStamp(timeStamp: number): Self.Date;

		/**
		 * Returns the Date for the current moment (including time)
		 */
		static now(): Self.Date;

		/**
		 * Returns the today date (excluding time information)
		 */
		static today(): Self.Date;

		/**
		 * Returns this months date (excluding day and time)
		 */
		static thisMonth(): Self.Date;

		/**
		 * Compare two dates that can be null
		 */
		static equals(left: (Self.Date | null), right: (Self.Date | null), dateOnly?: boolean): boolean;

		/**
		 * Compare two dates that can be null. Ignores the time component.
		 */
		static dateOnlyEquals(left: (Self.Date | null), right: (Self.Date | null)): boolean;

		/**
		 * Compare two dates including the time. Both dates can be null.
		 */
		static dateTimeEquals(left: (Self.Date | null), right: (Self.Date | null)): boolean;

		/**
		 * Returns this year date (excluding month, day and time)
		 */
		static thisYear(): Self.Date;

	}

	export namespace Date {
		enum Format {
			isoDate,
			isoTime,
			isoDateTime,
		}

	}

	/**
	 * Date formatter
	 */
	class DateFormat {
	}

	namespace DateFormat {
	}

	/**
	 * Decorator class and factory methods
	 */
	export class Decorator {
		/**
		 * Constructor
		 */
		constructor(options: object);

		/**
		 * Automation attributes
		 */
		attributes(context: object): object;

		/**
		 * Get the list of styles for this decorator
		 */
		styles(css: object, context: object): globalThis.Array<Self.Style>;

		/**
		 * Get decorator context values
		 */
		context(context: object): (object | null);

		/**
		 * Creates background decorator with given parameters
		 */
		static background(args: Self.Decorator.ColorOptions): Self.Decorator;

		/**
		 * Creates border decorator with given parameters. If no side is specified then border is created on all sides.
		 */
		static border(args: Self.Decorator.BorderOptions): Self.Decorator;

		/**
		 * Creates font decorator
		 */
		static font(args: Self.Decorator.FontOptions): Self.Decorator;

		/**
		 * Creates margin decorator with given parameters. If no side is specified then margin is created on all sides.
		 */
		static margin(args: (Self.Decorator.Margin | Self.Decorator.BoxOptions)): Self.Decorator;

		/**
		 * Creates padding decorator with predefined size specified by passed value.
		 */
		static padding(args: (Self.Decorator.Padding | Self.Decorator.BoxOptions)): Self.Decorator;

		/**
		 * Creates shape decorator
		 */
		static shape(shape: Self.Decorator.Shape): Self.Decorator;

		/**
		 * Creates depth decorator
		 */
		static depth(depth: Self.Decorator.Depth): Self.Decorator;

		/**
		 * Creates custom decorator
		 */
		static custom(options: {background?: Self.Decorator.ColorOptions; border?: Self.Decorator.BorderOptions; margin?: Self.Decorator.BoxOptions; padding?: Self.Decorator.BoxOptions; depth?: Self.Decorator.Depth; shape?: Self.Decorator.Shape; font?: Self.Decorator.FontOptions}): Self.Decorator;

		/**
		 * Combine multiple decorators into a single one
		 */
		static combine(...decorators: globalThis.Array<Self.Decorator>): Self.Decorator;

		/**
		 * Get a list of decorator styles
		 */
		static styles(decorator: (Self.Decorator | null), css: object, context: object): globalThis.Array<Self.Style>;

		/**
		 * Get decorator attributes
		 */
		static attributes(decorator: (Self.Decorator | null), context: object): object;

		/**
		 * Get decorator context
		 */
		static context(decorator: (Self.Decorator | null), context: object): object;

		/**
		 * Returns decorator dynamic styles. Do not call this directly, use theme.getComponentStyles(Decorator) which caches the result.
		 */
		static getStyles(theme: Self.Theme): object;

		/**
		 * Empty decorator
		 */
		static none: Self.Decorator;

	}

	export namespace Decorator {
		interface BadgeOptions {
			color?: Self.Decorator.Color;

			strength?: Self.Decorator.Strength;

			filled?: boolean;

		}

		interface ColorOptions {
			color: Self.Decorator.Color;

			strength?: Self.Decorator.Strength;

		}

		interface FontOptions {
			size?: Self.Decorator.FontSize;

			weight?: Self.Decorator.FontWeight;

			color?: Self.Decorator.Color;

			strength?: Self.Decorator.Strength;

			style?: Self.Decorator.FontStyle;

			textDecoration?: Self.Decorator.TextDecoration;

		}

		interface BorderOptions {
			type?: Self.Decorator.BorderType;

			color?: Self.Decorator.Color;

			strength?: Self.Decorator.Strength;

			weight?: Self.Decorator.BorderWeight;

			start?: boolean;

			end?: boolean;

			top?: boolean;

			bottom?: boolean;

		}

		interface BoxOptions {
			start?: (Self.Decorator.Padding | Self.Decorator.Margin);

			end?: (Self.Decorator.Padding | Self.Decorator.Margin);

			top?: (Self.Decorator.Padding | Self.Decorator.Margin);

			bottom?: (Self.Decorator.Padding | Self.Decorator.Margin);

			horizontal?: (Self.Decorator.Padding | Self.Decorator.Margin);

			vertical?: (Self.Decorator.Padding | Self.Decorator.Margin);

		}

		/**
		 * Border weight
		 */
		enum BorderWeight {
			NONE,
			DEFAULT,
			MEDIUM,
			THICK,
		}

		/**
		 * Border type
		 */
		enum BorderType {
			SOLID,
			DASHED,
			DOTTED,
		}

		/**
		 * Shape settings
		 */
		enum Shape {
			SQUARE,
			ROUNDED_SMALL,
			ROUNDED_LARGE,
		}

		/**
		 * Depth settings
		 */
		enum Depth {
			SMALL,
			MEDIUM,
			LARGE,
		}

		/**
		 * Margin settings
		 */
		enum Margin {
			NONE,
			XXXXS,
			XXXS,
			XXS,
			XS,
			S,
			M,
			L,
			XL,
			TINY,
			SMALL,
			MEDIUM,
			LARGE,
		}

		/**
		 * Padding settings
		 */
		enum Padding {
			NONE,
			XXXXS,
			XXXS,
			XXS,
			XS,
			S,
			M,
			L,
			XL,
			TINY,
			SMALL,
			MEDIUM,
			LARGE,
		}

		/**
		 * Color settings
		 */
		enum Color {
			NEUTRAL,
			THEMED,
			DANGER,
			WARNING,
			SUCCESS,
			INFO,
			WHITE,
		}

		/**
		 * Strength settings
		 */
		enum Strength {
			LIGHTEST,
			LIGHTER,
			LIGHT,
			NEUTRAL,
			DARK,
			DARKER,
			DARKEST,
			STRONG,
			MEDIUM,
			WEAK,
		}

		/**
		 * Font weight settings
		 */
		enum FontWeight {
			NORMAL,
			SEMIBOLD,
			BOLD,
		}

		/**
		 * Font size settings
		 */
		enum FontSize {
			SMALLER,
			SMALL,
			REGULAR,
			MEDIUM,
			LARGE,
			LARGER,
			LARGEST,
		}

		/**
		 * Font style settings
		 */
		enum FontStyle {
			NORMAL,
			ITALIC,
		}

		/**
		 * Text decoration settings
		 */
		enum TextDecoration {
			UNDERLINE,
		}

	}

	/**
	 * DeviceMetadataService used to determine device information.
	 */
	export class DeviceMetadataService implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs DeviceMetadataService
		 */
		constructor(options?: Self.DeviceMetadataService.Options);

		/**
		 * Device type, one of DeviceMetadataService.DeviceType
		 */
		deviceType: string;

		/**
		 * Screen viewport size, one of DeviceMetadataService.Viewport
		 */
		viewport: string;

		/**
		 * Screen orientation, one of DeviceMetadataService.Orientation
		 */
		orientation: string;

		/**
		 * Screen info
		 */
		screenInfo: Self.DeviceMetadataService.ScreenInfo;

		private _setMediaQueries(): void;

		private _getDeviceType(): void;

		private _getScreenInfo(): void;

		private _getOrientation(): void;

		private _getViewportSize(): void;

		private _setEvents(): void;

		static Event: Self.DeviceMetadataService.EventTypes;

	}

	export namespace DeviceMetadataService {
		interface EventTypes {
			VIEWPORT_CHANGED: string;

			ORIENTATION_CHANGED: string;

		}

		interface Size {
			height?: number;

			width?: number;

		}

		interface ScreenInfo {
			density?: number;

			hasTouchScreen?: boolean;

			resolution?: Self.DeviceMetadataService.Size;

			size?: Self.DeviceMetadataService.Size;

		}

		interface Options {
			window?: PackageComponent.Window;

			on?: Self.EventSource.ListenerMap;

		}

		enum DeviceType {
			PHONE,
			TABLET,
			DESKTOP,
			UNKNOWN,
		}

		enum Orientation {
			PORTRAIT,
			LANDSCAPE,
		}

		enum Viewport {
			SMALL,
			MEDIUM,
			LARGE,
			X_LARGE,
		}

	}

	export class DragDropGhost extends Self.Component {
		/**
		 * Constructs DragDropGhost
		 */
		constructor(options: Self.DragDropGhost.Options);

		/**
		 * Content component
		 */
		content: (Self.Component | Self.JSX.Element | null);

		/**
		 * Ghost offset
		 */
		offset: Self.DragDropGhost.Offset;

		/**
		 * Ghost icon
		 */
		icon: (Self.Component | Self.JSX.Element | null);

		/**
		 * Initializes the ghost from a given DOM element
		 */
		initializeFromElement(element: Element, cursorPosition: Self.PointerMessage.Position): void;

		/**
		 * Sets content
		 */
		setContent(content: (Self.Component | Self.JSX.Element | null)): void;

		/**
		 * Sets offset
		 */
		setOffset(offset: Self.DragDropGhost.Offset): void;

		/**
		 * Sets icon
		 */
		setIcon(icon: (Self.Component | Self.JSX.Element | null)): void;

		/**
		 * Clone element and fixes its size
		 */
		static cloneElement(element: Element): Self.JSX.Element;

		/**
		 * Get the mouse cursor position inside an element
		 */
		static getCursorOffsetInElement(element: Element, cursorPosition: Self.PointerMessage.Position): Self.DragDropGhost.Offset;

	}

	export namespace DragDropGhost {
		interface Options extends Self.Component.Options {
			content?: (Self.Component | Self.JSX.Element);

			icon?: (Self.Component | Self.JSX.Element);

			offset?: Self.DragDropGhost.Offset;

		}

		interface Offset {
			x: number;

			y: number;

		}

	}

	namespace ElementBuilder {
		/**
		 * Add classes to a DOM element
		 */
		function addClasses(element: Element, classes: (string | globalThis.Array<any> | object | Self.Style)): void;

		/**
		 * Add data attributes to a DOM element
		 */
		function addData(element: Element, data: object): void;

		/**
		 * Add attributes to a DOM element
		 */
		function applyAttributes(element: Element, attributes: (null | undefined | string | globalThis.Array<any> | object)): void;

		/**
		 * Add children a DOM element
		 */
		function addChildren(element: Element, children: any): void;

		/**
		 * Create a DOM element
		 */
		function makeElement(elementName: string, attributes: (string | globalThis.Array<any> | object | null), children: any): HTMLElement;

		/**
		 * Create a DOM element in namespace ns
		 */
		function makeElementNS(ns: string, elementName: string, attributes: (string | globalThis.Array<any> | object | null), children: any): Element;

	}

	/**
	 * This is a very rough Component mock that can be used to create a pseudo component around a standard DOM element. It can be used in legacy as an owner of windows or for displaying tooltips on non-UIF elements.
	 */
	export class ElementComponent {
	}

	export namespace ElementComponent {
	}

	/**
	 * Event bus
	 */
	export class EventBus {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * Subscribe to a particular sender
		 */
		subscribe(sender: (string | object), listener: (((args: object) => void) | Self.EventBusListener)): {remove: () => void};

		publish(sender: (string | object), notification: object): void;

	}

	export namespace EventBus {
	}

	/**
	 * Message listener
	 */
	export interface EventBusListener {
		/**
		 * Reports a notification to a specific output
		 */
		process(args: object): void;

	}

	export namespace EventBusListener {
	}

	/**
	 * Interface for classes with events
	 */
	export interface EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

	}

	export namespace EventSource {
		type ListenerCallback = (args: any, sender: any) => void;

		interface ListenerObject {
			listener: Self.EventSource.ListenerCallback;

			once?: boolean;

		}

		interface Handle {
			off: () => void;

		}

		type Listener = (Self.EventSource.ListenerObject | Self.EventSource.ListenerCallback);

		type EventName = (string | symbol);

		type ListenerMap = Record<Self.EventSource.EventName, Self.EventSource.Listener>;

	}

	/**
	 * Mixin implementing the EventSource interface. Provides on, off and _fireEvent methods.
	 */
	/**
	 * Move tabbable between registered components
	 */
	export class ExclusiveTabbableFocusHandler {
		/**
		 * Constructs ExclusiveTabbableFocusHandler
		 */
		constructor();

		/**
		 * True if the component is focusable
		 */
		effectiveFocusable: boolean;

		/**
		 * True if the component can be focusable
		 */
		focusable: boolean;

		/**
		 * True if the component is tabbable
		 */
		effectiveTabbable: boolean;

		/**
		 * True if the component can be tabbable
		 */
		tabbable: boolean;

		/**
		 * Current focus target component
		 */
		focusComponent: Self.Component;

		/**
		 * The active handler
		 */
		activeHandler: (Self.FocusHandler | null);

		/**
		 * Updates
		 */
		update(): void;

		/**
		 * Focuses
		 */
		focus(): boolean;

		/**
		 * Check if focused
		 */
		isFocused(focusComponent: Self.Component): boolean;

		/**
		 * Adds handler
		 */
		addHandler(handler: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		/**
		 * Removes handler
		 */
		removeHandler(handler: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		/**
		 * Sets handlers
		 */
		setHandlers(handlers: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		/**
		 * Sets active handler
		 */
		setActiveHandler(handler: Self.FocusHandler): void;

		/**
		 * Returns new ExclusiveTabbableFocusHandler
		 */
		static factory(args: object): Self.ExclusiveTabbableFocusHandler;

	}

	export namespace ExclusiveTabbableFocusHandler {
	}

	/**
	 * Filter code.
	 */
	export enum FilterCode {
		KEY_DOWN,
		KEY_UP,
		KEY_PRESS,
		CLICK,
		DOUBLE_CLICK,
		FOCUS_IN,
		FOCUS_OUT,
		PASTE,
		CUT,
		SELECT,
		INPUT,
		WHEEL,
		CONTEXT_MENU,
		SCROLL,
		POINTER_ENTER,
		POINTER_OVER,
		POINTER_DOWN,
		POINTER_MOVE,
		POINTER_UP,
		POINTER_LEAVE,
		POINTER_OUT,
		CAPTURE_KEY_DOWN,
		CAPTURE_KEY_UP,
		CAPTURE_KEY_PRESS,
		CAPTURE_CLICK,
		CAPTURE_DOUBLE_CLICK,
		CAPTURE_FOCUS_IN,
		CAPTURE_FOCUS_OUT,
		CAPTURE_PASTE,
		CAPTURE_CUT,
		CAPTURE_SELECT,
		CAPTURE_INPUT,
		CAPTURE_WHEEL,
		CAPTURE_CONTEXT_MENU,
		CAPTURE_SCROLL,
		CAPTURE_POINTER_ENTER,
		CAPTURE_POINTER_OVER,
		CAPTURE_POINTER_DOWN,
		CAPTURE_POINTER_MOVE,
		CAPTURE_POINTER_UP,
		CAPTURE_POINTER_LEAVE,
		CAPTURE_POINTER_OUT,
	}

	/**
	 * Flag generator
	 */
	export class FlagGenerator {
		/**
		 * Constructor
		 */
		constructor(seed: number);

		/**
		 * Generate the next flag value
		 */
		next(): number;

	}

	export namespace FlagGenerator {
	}

	/**
	 * Flags class
	 */
	export class Flags {
		/**
		 * Constructor
		 */
		constructor(value: number);

		/**
		 * Get the current value
		 */
		value: number;

		/**
		 * Check whether value satisfies given flag combination
		 */
		is(flagCombination: number): boolean;

		/**
		 * Enable given flag combination
		 */
		set(flagCombination: number): Self.Flags;

		/**
		 * Unset given flag combination
		 */
		unset(flagCombination: number): Self.Flags;

		/**
		 * Invert the value of given flags
		 */
		flip(flagCombination: number): Self.Flags;

		/**
		 * Enable/disable given flags based on the second parameter
		 */
		toggle(flagCombination: number, toggle: boolean): Self.Flags;

		/**
		 * Compare this flags against another flag combination
		 */
		diff(flagCombination: (number | Self.Flags)): Self.Flags;

		/**
		 * Returns a new copy of this
		 */
		copy(): Self.Flags;

		/**
		 * Removes all flags
		 */
		clear(): Self.Flags;

		/**
		 * Check whether value satisfies given flag combination
		 */
		static is(value: number, flagCombination: number): boolean;

		/**
		 * Return a modified value with given flags enabled
		 */
		static set(value: number, flagCombination: number): number;

		/**
		 * Return a modified value with given flags disabled
		 */
		static unset(value: number, flagCombination: number): number;

		/**
		 * Return a modified value with given flags inverted
		 */
		static flip(value: number, flagCombination: number): number;

		/**
		 * Return a modified value with given flags enabled/disabled depending on the last parameter
		 */
		static toggle(value: number, flagCombination: number, toggle: boolean): number;

		/**
		 * Return the difference between two flag collections
		 */
		static diff(left: number, right: number): number;

	}

	export namespace Flags {
	}

	class FloatFormat {
	}

	namespace FloatFormat {
	}

	/**
	 * Focus handler
	 */
	export interface FocusHandler {
		/**
		 * True if the component is focusable
		 */
		effectiveFocusable: boolean;

		/**
		 * True if the component can be focusable
		 */
		focusable: boolean;

		/**
		 * True if the component is tabbable
		 */
		effectiveTabbable: boolean;

		/**
		 * True if the component can be tabbable
		 */
		tabbable: boolean;

		/**
		 * Current focus target component
		 */
		focusComponent: Self.Component;

		/**
		 * Updates
		 */
		update(): void;

		/**
		 * Focuses
		 */
		focus(): void;

		/**
		 * Check if focused
		 */
		isFocused(focusComponent: Self.Component): boolean;

	}

	export namespace FocusHandler {
	}

	export class FocusManager implements Self.MessageHandler {
		/**
		 * Constructs FocusManager
		 */
		constructor();

		/**
		 * Return current focused element
		 */
		focusedElement: (Element | null);

		/**
		 * Get the currently focused component
		 */
		focusedComponent: (Self.Component | null);

		/**
		 * Returns next or previous focusable element in current context
		 */
		getNextFocusableElementInDirection(forward: boolean, focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		/**
		 * Returns next focusable element in current context
		 */
		getNextFocusableElement(focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		/**
		 * Returns previous focusable element in current context
		 */
		getPreviousFocusableElement(focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		/**
		 * Focus next element in context
		 */
		focusNextElement(focusedElement?: Element, context?: Element, tabbable?: boolean): boolean;

		/**
		 * Focus previous element in context
		 */
		focusPreviousElement(focusedElement?: Element, context?: Element, tabbable?: boolean): boolean;

		/**
		 * Processes message
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace FocusManager {
	}

	export class FocusMessage extends Self.RoutedMessage {
		/**
		 * Constructs FocusMessage
		 */
		constructor(options: Self.FocusMessage.Options);

		/**
		 * Target element of event
		 */
		element: Element;

		/**
		 * Next focused element
		 */
		nextFocusedElement: Element;

		/**
		 * Next focused component
		 */
		nextFocusedComponent: Self.Component;

		/**
		 * Previous focused element
		 */
		previousFocusedElement: Element;

		/**
		 * Previous focused component
		 */
		previousFocusedComponent: Self.Component;

		/**
		 * Creates message from FocusEvent
		 */
		static fromEvent(event: FocusEvent): Self.FocusMessage;

	}

	export namespace FocusMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

			nextFocusedElement: Element;

			nextFocusedComponent: Self.Component;

			previousFocusedElement: Element;

			previousFocusedComponent: Self.Component;

		}

	}

	/**
	 * Supported format service formats
	 */
	export enum Format {
		DATE,
		DATE_TIME,
		TIME,
		INTEGER,
		FLOAT,
	}

	/**
	 * Format service for conversion between string and various other data types
	 */
	export class FormatService {
		/**
		 * Constructor
		 */
		constructor(formats?: object);

		/**
		 * Convert value to a string. Empty string is returned for null and invalid values.
		 */
		format(value: any, format: Self.FormatService.Format, options?: object): string;

		/**
		 * Parse a value from a string. Null is returned for empty string or invalid values.
		 */
		parse(value: any, format: Self.FormatService.Format, options?: object): any;

		/**
		 * Customize this format service with new formatters. Returns a new format service.
		 */
		with(formats: object): Self.FormatService;

		/**
		 * Create default formatters for a given localization context
		 */
		static forI18n(i18n: Self.I18n): Self.FormatService;

	}

	export namespace FormatService {
		export import Format = Self.Format;

	}

	/**
	 * Utility functions for functions
	 */
	export namespace Function {
		/**
		 * Function that does nothing and returns nothing
		 */
		function VOID(): void;

		/**
		 * Function that always returns null
		 */
		function NULL(): null;

		/**
		 * Function that returns its first input argument (unmodified)
		 */
		function IDENTITY(value: any): any;

		/**
		 * Function that compares two values using the three equals operator
		 */
		function STRICT_EQUALS(left: any, right: any): boolean;

		/**
		 * Function that always returns true
		 */
		function TRUE(): boolean;

		/**
		 * Function that always returns false
		 */
		function FALSE(): boolean;

		/**
		 * Creates a function that returns given value
		 */
		function VALUE(value: any): () => any;

		/**
		 * Throttles calls to the callback
		 */
		function throttle(callback: (...args: globalThis.Array<any>) => void, interval?: number): (...args: globalThis.Array<any>) => void;

		/**
		 * Debounce calls to the callback
		 */
		function debounce(callback: (...args: globalThis.Array<any>) => void, interval?: number): (...args: globalThis.Array<any>) => void;

		/**
		 * Given an array of functions run them all
		 */
		function runAll(list: globalThis.Array<() => void>): void;

		/**
		 * Create a memoized function (single argument)
		 */
		function memoize(func: (arg: any) => any): (arg: any) => any;

		/**
		 * Create a function that caches the result of its last input. If it is called with the same input it will return the cached result.
		 */
		function memoizeLast(func: (arg: any) => any): (arg: any) => any;

		/**
		 * Run a callback in a try catch. If it fails run the errorCallback instead.
		 */
		function runSafely<T>(callback?: () => T, errorCallback?: (error: Error) => T): T;

	}

	/**
	 * Generic data source
	 */
	class GenericDataSource implements Self.DataSource, Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs GenericDataSource
		 */
		constructor(query: Self.DataSource.QueryCallback);

		/**
		 * Creates a query over the data source
		 */
		query(args: object, resolve: (args: {items: globalThis.Array<any>}) => void, reject: (error: any) => void): void;

	}

	namespace GenericDataSource {
	}

	/**
	 * Hash based router
	 */
	export function HashRouter(props?: object): Self.JSX.Element;

	/**
	 * Hierarchical map
	 */
	export class HierarchicalMap {
		/**
		 * Constructs HierarchicalMap
		 */
		constructor(parent?: Self.HierarchicalMap);

		/**
		 * Parent map
		 */
		parent: (Self.HierarchicalMap | null);

		add(key: any, value: any): void;

		/**
		 * Remove the value for given key
		 */
		remove(key: any): any;

		/**
		 * Get the value for given key
		 */
		get(key: any): any;

		/**
		 * Check if the map contains a key
		 */
		has(key: any): boolean;

		/**
		 * Remove all entries from the map
		 */
		clear(): void;

		/**
		 * Get the list of registered services
		 */
		flatten(): object;

	}

	export namespace HierarchicalMap {
	}

	/**
	 * Function component hooks
	 */
	export namespace Hook {
		type EffectCleanupCallback = () => void;

		/**
		 * State hook
		 */
		function useState<T = any>(initialState: T): [T, (state: T) => void];

		/**
		 * Layout effect hook
		 */
		function useEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

		/**
		 * Layout effect hook
		 */
		function useLayoutEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

		/**
		 * Context hook
		 */
		function useContext<T = any>(type: string): T;

		/**
		 * Style hook
		 */
		function useStyles(provider: (theme: Self.Theme) => object): any;

		/**
		 * Reducer hook
		 */
		function useReducer(reducer: (state: any, action: object) => any, initialState: any): [any, (action: object) => any];

		/**
		 * Ref hook
		 */
		function useRef<T = any>(initialValue?: T): Self.VDomRef<T>;

		/**
		 * Callback hook
		 */
		function useCallback<T extends Function>(callback: T, dependencies?: globalThis.Array<any>): T;

		/**
		 * Memo hook
		 */
		function useMemo<T>(create: () => T, dependencies?: globalThis.Array<any>): T;

		/**
		 * Dispatch hook
		 */
		function useDispatch(): Self.Store.DispatchFunc;

		/**
		 * Select value from the Store
		 */
		function useSelector<State, Selected>(selector: (state: State) => Selected, equalityFn?: (left: Selected, right: Selected) => boolean): Selected;

		/**
		 * Generate a unique ID that is stable across re-renders
		 */
		function useId(): string;

	}

	/**
	 * Html related utilities
	 */
	export namespace Html {
		/**
		 * Get width of native scrollbar
		 */
		function getScrollbarWidth(): number;

		/**
		 * Find the closest parent element matching selector. If selector is empty then direct parent is returned.
		 */
		function getParent(startElement: Node, selector?: (string | ((element: Element) => boolean)), stopElement?: Node): (Node | null);

		/**
		 * Find children matches selector(or the first findFirstN elements)
		 */
		function getChildren(parent: HTMLElement, selector: (string | ((element: Element) => boolean)), findFirstN?: number): globalThis.Array<Node>;

		/**
		 * Get nth child, which matches selector (numbered from 0)
		 */
		function getChild(parent: HTMLElement, selector: (string | ((element: Element) => boolean)), index?: number): HTMLElement;

		/**
		 * Deserialize data object from script tag containing JSON
		 */
		function getDataFromJSON(elementID: string): object;

		/**
		 * Insert node as the last child of parent.
		 */
		function appendChild(parent: Element, element: Element): void;

		/**
		 * Appends multiple DOM elements as the last children of parent
		 */
		function appendChildren(parent: Element, elements: globalThis.Array<Element>): void;

		/**
		 * Insert node as a first child of parent.
		 */
		function prependChild(parent: Element, element: Element): void;

		/**
		 * Insert node as a child of parent at specific position.
		 */
		function insertChild(parent: Element, element: Element, index?: number): void;

		/**
		 * Insert element before target element
		 */
		function insertBefore(target: Node, element: Node): void;

		/**
		 * Insert element after target element
		 */
		function insertAfter(target: Node, element: Node): void;

		/**
		 * Replace element with another one
		 */
		function replaceElement(newElement: Element, element: Element): Element;

		/**
		 * Detach element from dom tree.
		 */
		function detach(element: Node): void;

		/**
		 * Clear content of element
		 */
		function clear(element: HTMLElement): void;

		/**
		 * Copy all attributes from source element to target element
		 */
		function copyAttributes(source: Element, destination: Element, overwrite?: boolean): void;

		/**
		 * Remove all attributes from an element
		 */
		function clearAttributes(element: HTMLElement): void;

		/**
		 * Get element offset to another element (floats)
		 */
		function getElementOffset(element: HTMLElement, baseElement: HTMLElement): {top: number; left: number};

		/**
		 * Get element offset to document
		 */
		function getDocumentOffset(element: HTMLElement): {top: number; left: number};

		/**
		 * Converts box coordinates from client space to document space (floats)
		 */
		function viewportToDocumentCoordinates(box: {top: number; left: number; height: number; width: number}): {top: number; left: number; height: number; width: number};

		/**
		 * Get position of element borderBox to window (in document coordinates)
		 */
		function documentBorderBox(element: HTMLElement): {top: number; left: number; width: number; height: number};

		/**
		 * Get position of element marginBox to window (in document coordinates)
		 */
		function documentMarginBox(element: HTMLElement): {top: number; left: number; width: number; height: number};

		/**
		 * Get the element content box
		 */
		function viewportContentBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		/**
		 * Get the element border box
		 */
		function viewportBorderBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		/**
		 * Get the element margin box
		 */
		function viewportMarginBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		/**
		 * Get size of whole document
		 */
		function documentBox(): Self.Rectangle;

		/**
		 * Get size of window
		 */
		function windowBox(): {top: number; left: number; height: number; width: number};

		/**
		 * Calculates dimensions of an element as it would be without flex-grow and flex-shrink applied
		 */
		function naturalSize(element: HTMLElement): {width: number; height: number};

		/**
		 * Calculate elements offset box
		 */
		function offsetBox(element: Element): {top: number; left: number; width: number; height: number};

		/**
		 * Checks that element is focusable/tabbable
		 */
		function isFocusableElement(element: HTMLElement, tabbable?: boolean): boolean;

		/**
		 * Copy element contents to clipboard
		 */
		function copyElementToClipboard(element: Element): void;

		/**
		 * Clear selection in the whole document
		 */
		function clearSelection(): void;

		/**
		 * Wait for document ready event
		 */
		function waitDocumentReady(): globalThis.Promise<void>;

		/**
		 * Load a script file
		 */
		function loadScript(url: string, customize?: (script: HTMLScriptElement) => void): globalThis.Promise<void>;

		/**
		 * Load a script file
		 */
		function loadStyleSheet(url: string, customize?: (link: HTMLLinkElement) => void): globalThis.Promise<void>;

		namespace Element {
			enum Section {
				DIV,
				ARTICLE,
				ASIDE,
				FOOTER,
				HEADER,
				MAIN,
				NAV,
				SECTION,
			}

		}

	}

	/**
	 * Dictionary of element attributes
	 */
	export class HtmlAttributeList {
		/**
		 * Constructs HtmlAttributeList
		 */
		constructor(attributes?: Record<string, string>, options?: {onChange?: Self.HtmlAttributeList.ChangeCallback});

		/**
		 * Apply attributes to an element
		 */
		applyToElement(element: HTMLElement): void;

		/**
		 * Get attribute value
		 */
		get(name: string): (string | null);

		/**
		 * Set attribute value
		 */
		set(name: (string | Record<string, string>), value?: (string | boolean)): void;

		/**
		 * Remove attribute
		 */
		remove(name: (string | globalThis.Array<string>)): void;

		/**
		 * Adds an entry into multi value attribute
		 */
		addEntry(name: (string | Record<string, (string | boolean | globalThis.Array<string>)>), value?: (string | boolean | globalThis.Array<string>)): void;

		/**
		 * Removes an entry from multi value attribute
		 */
		removeEntry(name: (string | Record<string, (string | boolean | globalThis.Array<string>)>), value?: (string | boolean | globalThis.Array<string>)): void;

		/**
		 * Add or remove attribute depending on whether value is set
		 */
		toggle(name: string, value: (string | null)): void;

		/**
		 * Check if attribute has been set
		 */
		has(name: string): boolean;

		/**
		 * Clear all attributes
		 */
		clear(): void;

		/**
		 * Set attribute to value if condition is met, otherwise remove the attribute
		 */
		setIf(key: string, value: string, condition: boolean): void;

		/**
		 * Apply the difference between two attribute lists
		 */
		applyDiff(oldValue: Record<string, string>, newValue: Record<string, string>): void;

	}

	export namespace HtmlAttributeList {
		type ChangeCallback = (added: Record<string, string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	/**
	 * Html class list
	 */
	export class HtmlClassList {
		/**
		 * Constructs HtmlClassList
		 */
		constructor(classList?: Self.HtmlClassList.ClassList, options?: {onChange?: Self.HtmlClassList.ChangeCallback});

		/**
		 * Apply classes to an element
		 */
		applyToElement(element: HTMLElement): void;

		/**
		 * Add class names
		 */
		add(classNames: (string | globalThis.Array<string>)): void;

		/**
		 * Remove class names
		 */
		remove(classNames: (string | globalThis.Array<string>)): void;

		/**
		 * Toggle class names
		 */
		toggle(classNames: (string | globalThis.Array<string> | Record<string, boolean>), value?: boolean): void;

		/**
		 * Check if class list contains a particular class name
		 */
		has(className: (string | Self.Style)): boolean;

		/**
		 * Apply the difference between two class lists
		 */
		applyDiff(oldValue: Self.HtmlClassList.ClassList, newValue: Self.HtmlClassList.ClassList): void;

	}

	export namespace HtmlClassList {
		type ClassList = (string | Self.Style | globalThis.Array<(string | Self.Style)> | Record<string, boolean>);

		type ChangeCallback = (added: globalThis.Array<string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	/**
	 * Dictionary of element inline styles
	 */
	export class HtmlStyleList {
		/**
		 * Constructs HtmlStyleList
		 */
		constructor(style?: Record<string, string>, options?: {onChange?: Self.HtmlStyleList.ChangeCallback});

		/**
		 * Apply inline styles to element
		 */
		applyToElement(element: HTMLElement): void;

		/**
		 * Get inline style value
		 */
		get(name: string): (string | null);

		/**
		 * Set inline style value
		 */
		set(name: (string | Record<string, string>), value?: string): void;

		/**
		 * Remove inline style
		 */
		remove(name: (string | globalThis.Array<string>)): void;

		/**
		 * Add or remove style depending on whether value is set
		 */
		toggle(name: string, value: (string | null)): void;

		/**
		 * Check if inline style has been set
		 */
		has(name: string): boolean;

		/**
		 * Removes all style rules
		 */
		clear(): void;

		/**
		 * Apply the difference between two style lists
		 */
		applyDiff(oldValue: Record<string, string>, newValue: Record<string, string>): void;

	}

	export namespace HtmlStyleList {
		type ChangeCallback = (added: Record<string, string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	export class HttpPostDataFormatter extends Self.LogFormatter {
		/**
		 * Constructs HttpPostDataFormatter
		 */
		constructor();

	}

	export namespace HttpPostDataFormatter {
	}

	/**
	 * Internationalization context
	 */
	export class I18n {
		/**
		 * Constructs I18n
		 */
		constructor(options?: object);

		/**
		 * Get the default date format
		 */
		dateFormat: string;

		/**
		 * Get the default time format
		 */
		timeFormat: string;

		/**
		 * Localized month labels
		 */
		monthLabels: {short: globalThis.Array<string>; long: globalThis.Array<string>};

		/**
		 * Localized day labels
		 */
		dayLabels: {short: globalThis.Array<string>; long: globalThis.Array<string>};

		/**
		 * Localized am/pm labels
		 */
		amPmLabels: globalThis.Array<string>;

		/**
		 * First day of the week. 0 = Sunday.
		 */
		firstDayOfWeek: number;

		/**
		 * right-to-left environment.
		 */
		rtl: boolean;

		/**
		 * Unicode BCP 47 locale identifier
		 */
		language: string;

		/**
		 * Get a translated string
		 */
		get(args: (string | Self.I18n.GetParam)): string;

		/**
		 * Add translation
		 */
		set(args: {key?: string; text?: string}): Self.I18n;

		/**
		 * Remove a translation
		 */
		remove(args: {key?: string}): Self.I18n;

		/**
		 * Remove all translations
		 */
		clear(): Self.I18n;

		/**
		 * Add a translation bundle
		 */
		addBundle(bundle: object): Self.I18n;

		/**
		 * Compares strings in the given locale
		 */
		compare(left: string, right: string): number;

		/**
		 * Create a new I18n object from a translation bundle
		 */
		static fromBundle(translations: object): Self.I18n;

		/**
		 * Create I18n object from locale. This is used in examples, catalog and app template.
		 */
		static fromLocale(locale: object, options: object): Self.I18n;

	}

	export namespace I18n {
		interface GetParam {
			key: string;

			default?: string;

			params?: object;

		}

	}

	/**
	 * Image constants
	 */
	namespace ImageConstant {
		/**
		 * Image size
		 */
		enum Size {
			XXS,
			XS,
			S,
			M,
			L,
			XL,
			XXL,
		}

		/**
		 * Border radius
		 */
		enum BorderRadius {
			SQUARE,
			ROUNDED,
			ROUND,
		}

		/**
		 * Image color
		 */
		enum Color {
			NEUTRAL,
			THEMED,
			DANGER,
			WARNING,
			SUCCESS,
			INFO,
			WHITE,
		}

		/**
		 * Color strength settings
		 */
		enum ColorStrength {
			LIGHTEST,
			LIGHTER,
			LIGHT,
			NEUTRAL,
			DARK,
			DARKER,
			DARKEST,
		}

	}

	/**
	 * Immutable image metadata object
	 */
	export class ImageMetadata {
		/**
		 * Constructs ImageMetadata
		 */
		constructor(options?: (Self.ImageMetadata.Options | string));

		/**
		 * ImageMetadata caption
		 */
		caption: (string | Self.Translation | null);

		/**
		 * ImageMetadata url
		 */
		url: (string | null);

		/**
		 * True if image should be mirrored in RTL setting
		 */
		rtlSensitive: boolean;

		/**
		 * Returns current image metadata options
		 */
		getOptions(theme?: Self.Theme): Self.ImageMetadata.Options;

		/**
		 * Returns a new image with a modified styleable property
		 */
		withStyleable(styleable: boolean): Self.ImageMetadata;

		/**
		 * Returns a new image with a modified size
		 */
		withSize(widthOrSize: (string | number | Self.ImageMetadata.Size), height?: (string | number)): Self.ImageMetadata;

		/**
		 * Removes any size specification
		 */
		withNoSize(): Self.ImageMetadata;

		/**
		 * Returns a new image with a modified caption
		 */
		withCaption(caption: (string | Self.Translation)): Self.ImageMetadata;

		/**
		 * If this image already has a caption it is returned. Otherwise returns a new image with the desired caption.
		 */
		withDefaultCaption(defaultCaption: string): Self.ImageMetadata;

		/**
		 * Returns a new image with a modified class name
		 */
		withClassName(name: string): Self.ImageMetadata;

		/**
		 * Returns a new image metadata with given offset
		 */
		withOffset(offset: object): Self.ImageMetadata;

		/**
		 * Extends image metadata with given options
		 */
		withOptions(options: object): Self.ImageMetadata;

		/**
		 * Creates a new image with a class added to its class list
		 */
		addClass(className: string): Self.ImageMetadata;

		/**
		 * Returns a new image with a modified url
		 */
		withUrl(url: string): Self.ImageMetadata;

		/**
		 * Returns a new image with modified RTL sensitivity
		 */
		withRTLSensitive(rtlSensitive: boolean): Self.ImageMetadata;

		/**
		 * Returns a new image with modified theme specific options
		 */
		withThemeSpecificOptions(themeSpecificOptions: (theme: Self.Theme) => object): Self.ImageMetadata;

		/**
		 * Create a new image instance with modified options
		 */
		private _clone(options: object): Self.ImageMetadata;

		/**
		 * Creates a new image instance with a given parameters
		 */
		static create(options: (string | Self.Url | globalThis.Array<string> | Self.ImageMetadata | Self.ImageMetadata.Options)): Self.ImageMetadata;

		/**
		 * Creates a new image with a given url
		 */
		static withUrl(url: string): Self.ImageMetadata;

		/**
		 * Create a new image with a given class name
		 */
		static withClassName(classList: (string | globalThis.Array<string>)): Self.ImageMetadata;

		/**
		 * Create a new image with a given caption
		 */
		static withCaption(caption: string): Self.ImageMetadata;

		/**
		 * Type accepted by ImageMetadata.create method
		 */
		static Source: Self.Type.Matcher;

	}

	export namespace ImageMetadata {
		interface FrameSettings {
			frameWidth: number;

			frameHeight: number;

			keys?: globalThis.Array<string>;

		}

		interface Options {
			styleable?: boolean;

			classList?: (string | globalThis.Array<string>);

			url?: string;

			offset?: {x?: (number | string); y?: (number | string)};

			width?: (number | string);

			height?: (number | string);

			repeat?: boolean;

			caption?: string;

			rtlSensitive?: boolean;

			frameSettings?: Self.ImageMetadata.FrameSettings;

			themeSpecificOptions?: (theme: Self.Theme) => object;

		}

		export import Size = Self.ImageConstant.Size;

	}

	/**
	 * Immutable array
	 */
	export class ImmutableArray {
		/**
		 * Immutable array constructor
		 */
		constructor(array?: globalThis.Array<any>);

		/**
		 * Get iterator
		 */
		[Symbol.iterator](): any;

		/**
		 * True if the array is empty
		 */
		empty: boolean;

		/**
		 * Array length
		 */
		length: number;

		/**
		 * Reference to the first item
		 */
		firstItem: (null | any);

		/**
		 * Reference to the last item
		 */
		lastItem: (null | any);

		/**
		 * Return first item or a default value if array is empty
		 */
		firstItemOrDefault(defaultValue: any): any;

		/**
		 * Return last item or a default value if array is empty
		 */
		lastItemOrDefault(defaultValue: any): any;

		/**
		 * Get item at index
		 */
		at(index: number): (null | any);

		/**
		 * Append item at the end of the array
		 */
		push(item: any): Self.ImmutableArray;

		/**
		 * Pop item from the end of the array
		 */
		pop(): Self.ImmutableArray;

		/**
		 * Insert item at index
		 */
		insert(index: number, item: any): Self.ImmutableArray;

		/**
		 * Remove a particular item from the array
		 */
		remove(value: any): Self.ImmutableArray;

		/**
		 * Remove item at index
		 */
		removeAt(index: number, count?: number): Self.ImmutableArray;

		/**
		 * Concatenate two arrays
		 */
		concat(array: Self.ImmutableArray): Self.ImmutableArray;

		/**
		 * Filter all items that do not satisfy the predicate
		 */
		filter(filter: (item: any, index: number) => boolean): Self.ImmutableArray;

		/**
		 * Transform the items
		 */
		map(transform: (item: any, index: number) => any): Self.ImmutableArray;

		/**
		 * Sorts the array using a comparator. Returns self if the array is already sorted.
		 */
		sort(comparator: (left: any, right: any) => number): Self.ImmutableArray;

		/**
		 * Convert to a native array
		 */
		toArray(): globalThis.Array<any>;

		/**
		 * Create immutable array of {count} items increasing by step
		 */
		static range(from: number, count: number, step?: number): Self.ImmutableArray;

		/**
		 * Create an array of {count} items where all items will be initialized to a given value
		 */
		static repeat(value: any, count: number): Self.ImmutableArray;

		/**
		 * Set the item at index and return a new array. If the item is already present at that index the same array is returned.
		 */
		static set(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		/**
		 * Return a new array with a given item appended
		 */
		static push(array: globalThis.Array<any>, item: any): globalThis.Array<any>;

		/**
		 * Return a new array without the last item
		 */
		static pop(array: globalThis.Array<any>): any;

		/**
		 * Remove items from the beginning
		 */
		static shift(array: globalThis.Array<any>, count?: number): globalThis.Array<any>;

		/**
		 * Insert item at the beginning of the array
		 */
		static unshift(array: globalThis.Array<any>, item: any): globalThis.Array<any>;

		/**
		 * Insert items at the beginning of the array
		 */
		static unshiftAll(array: globalThis.Array<any>, items: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Insert item into an array. Does not modify the input array.
		 */
		static insert(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		/**
		 * Insert items from a given array into another array. Does not modify the original array.
		 */
		static insertAll(array: globalThis.Array<any>, index: number, items: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Return a new array where items are moved to a different position.
		 */
		static reorder(array: globalThis.Array<any>, fromIndex: number, toIndex: number, count?: number): globalThis.Array<any>;

		/**
		 * Create a reversed array
		 */
		static reverse(array: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Remove the first matching value from array
		 */
		static remove(array: globalThis.Array<any>, value: any): globalThis.Array<any>;

		/**
		 * Remove items at specific index
		 */
		static removeAt(array: globalThis.Array<any>, index: number, count?: number): globalThis.Array<any>;

		/**
		 * Remove all values from the array
		 */
		static removeAll(array: globalThis.Array<any>, values: globalThis.Array<any>): globalThis.Array<any>;

		/**
		 * Filter array and return a new array keeping only the items matching the predicate
		 */
		static filter(array: globalThis.Array<any>, filter: (item: any, index: number) => boolean): globalThis.Array<any>;

		/**
		 * Filter array and return a new array only if at least one item is mapped to a different object
		 */
		static map(array: globalThis.Array<any>, transform: (item: any, index: number) => any): globalThis.Array<any>;

		/**
		 * Sort array using a comparator. Returns the same array if the array is already sorted.
		 */
		static sort(array: globalThis.Array<any>, comparator: (left: any, right: any) => number): globalThis.Array<any>;

		/**
		 * Empty immutable array constant
		 */
		static EMPTY: Self.ImmutableArray;

	}

	export namespace ImmutableArray {
	}

	/**
	 * Immutable object helpers
	 */
	export namespace ImmutableObject {
		/**
		 * Updates a nested property without modifying the source object. Returns a new object that reuses as much of the source as possible.
		 */
		function set(source: object, path: (globalThis.Array<string> | string | object), value?: any): object;

		/**
		 * Updates a nested property without modifying the source object. Returns a new object that reuses as much of the source as possible.
		 */
		function update(source: object, path: (globalThis.Array<string> | string), updater: (value: any) => any): object;

		/**
		 * Merge two objects into a new one or return the target when same
		 */
		function merge(target: object, source: object): object;

		/**
		 * Remove a nested property without modifying the source object. Returns a new object that reuses as much of the source as possible.
		 */
		function remove(source: object, path: (globalThis.Array<string> | string)): object;

		/**
		 * Map object values using a mapping function. Returns the same object if all mapped values are the same as the original values.
		 */
		function mapValues(object: object, mapper: (key: string, value: any) => any): object;

		/**
		 * Constant used in update(). Representing that the searched property does not exist in the object.
		 */
		const NO_VALUE: object;

	}

	/**
	 * Immutable set class
	 */
	export class ImmutableSet {
		/**
		 * Constructor
		 */
		constructor(iterable?: Iterable<any>);

		/**
		 * Get iterator
		 */
		[Symbol.iterator](): any;

		/**
		 * Array of values in the set
		 */
		values: globalThis.Array<any>;

		/**
		 * Size of the set
		 */
		size: number;

		/**
		 * True if the set is empty
		 */
		empty: boolean;

		/**
		 * Add value to the set
		 */
		add(value: any): Self.ImmutableSet;

		/**
		 * Add multiple values to the set
		 */
		addAll(values: globalThis.Array<any>): Self.ImmutableSet;

		/**
		 * Remove value from the set
		 */
		delete(value: any): Self.ImmutableSet;

		/**
		 * Remove multiple values from the set
		 */
		deleteAll(values: globalThis.Array<any>): Self.ImmutableSet;

		/**
		 * Add/remove item based on the second parameter
		 */
		toggle(item: any, add?: boolean): Self.ImmutableSet;

		/**
		 * Add/remove items based on the second parameter
		 */
		toggleAll(items: globalThis.Array<any>, add?: boolean): Self.ImmutableSet;

		/**
		 * Check if set contains a value
		 */
		has(value: any): boolean;

		/**
		 * Check if set contains all values
		 */
		hasAll(values: globalThis.Array<any>): boolean;

		/**
		 * Check if set contains any value
		 */
		hasAny(values: globalThis.Array<any>): boolean;

		/**
		 * Check if set contains another set
		 */
		contains(anotherSet: Self.ImmutableSet): boolean;

		/**
		 * Check if set equals another set
		 */
		equals(anotherSet: Self.ImmutableSet): boolean;

		/**
		 * Union set with another set
		 */
		union(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		/**
		 * Intersect set with another set
		 */
		intersect(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		/**
		 * Subtract another set from this set
		 */
		subtract(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		/**
		 * Execute callback for every value in the set
		 */
		forEach(callback: (item: any) => void, context: any): void;

		/**
		 * Remove values that do not match the predicate
		 */
		filter(predicate: (item: any) => boolean, context: any): Self.ImmutableSet;

		/**
		 * Transform values of the set
		 */
		map(transform: (item: any) => any, context: any): Self.ImmutableSet;

		/**
		 * Create an immutable set from a list of values
		 */
		static fromValues(...values: globalThis.Array<any>): Self.ImmutableSet;

		/**
		 * Create an immutable set from an array
		 */
		static fromArray(array: globalThis.Array<any>): Self.ImmutableSet;

		/**
		 * Immutable set constant
		 */
		static EMPTY: Self.ImmutableSet;

	}

	export namespace ImmutableSet {
	}

	export namespace ImmutableUpdate {
		/**
		 * Update an immutable state as if it was mutable. The function takes an original state and a callback to update the state. Any changes to the state in the callback are recorded and a new state is created reusing the parts of the original state that have not been changed. The original state is left unchanged.
		 */
		function of(base: object, recipe: (draft: any) => any, plugins?: globalThis.Array<any>): any;

	}

	export interface InputComponent {
		/**
		 * ID of the input element
		 */
		inputId: string;

		/**
		 * Returns attributes of the input element
		 */
		inputAttributes: Self.HtmlAttributeList;

		/**
		 * True if the input is empty
		 */
		empty: boolean;

		/**
		 * True if the input is mandatory
		 */
		mandatory: boolean;

	}

	export namespace InputComponent {
	}

	export interface InputController {
		/**
		 * Attaches controller to the given component
		 */
		attach(component: Self.Component): void;

		/**
		 * Detaches controller
		 */
		detach(): void;

		/**
		 * Resets controller
		 */
		reset(): void;

		/**
		 * Filters message
		 */
		filterMessage(message: object, result: object): void;

		/**
		 * Handles message
		 */
		handleMessage(message: object, result: object): void;

	}

	export namespace InputController {
	}

	class IntegerFormat {
	}

	namespace IntegerFormat {
	}

	/**
	 * Interface
	 */
	export class Interface extends Self.InterfaceMarker {
		/**
		 * Constructor
		 */
		constructor(definition: Self.Interface.Options);

		/**
		 * Interface name
		 */
		name: string;

		/**
		 * Unique interface id
		 */
		id: number;

		/**
		 * List of (direct) parent interfaces
		 */
		parentInterfaces: globalThis.Array<Self.Interface>;

		/**
		 * Interface methods
		 */
		methods: object;

		/**
		 * Interface properties
		 */
		properties: object;

		/**
		 * Get a transitive closure map of this interface and all its parent interfaces
		 */
		transitiveParents: object;

		/**
		 * Checks that all interface methods are implemented on a given object.
		 */
		verify(descriptor: Self.ClassDescriptor, name: string): void;

		/**
		 * Check whether object implements this interface
		 */
		isImplementedBy(obj: object): boolean;

		/**
		 * Check whether this interface extends another interface (transitively)
		 */
		isChildOf(superInterface: Self.Interface): void;

		/**
		 * Checks whether subInterface extends this interface
		 */
		isParentOf(subInterface: Self.Interface): void;

		/**
		 * Sanitize interface definition
		 */
		private _sanitizeDefinition(definition: object): void;

		/**
		 * Check whether method is a public method
		 */
		private _isPublicMethod(methodName: string): boolean;

		/**
		 * Validate interface definition
		 */
		private _validateDefinition(definition: object): void;

		/**
		 * Check taht the list of parent interfaces is valid
		 */
		private _validateParentInterfaces(name: string, interfaces: globalThis.Array<Self.Interface>): void;

		/**
		 * Check that interface api contains only public functions
		 */
		private _validatePublicMethods(name: string, methods: object): void;

		/**
		 * Create new interface
		 */
		static create(definition: Self.Interface.Options): Self.Interface;

	}

	export namespace Interface {
		/**
		 * Interface definition
		 */
		interface Options {
			methods?: object;

			properties?: object;

			parentInterfaces?: globalThis.Array<number>;

			name?: string;

		}

	}

	/**
	 * Marker object for interfaces
	 */
	class InterfaceMarker {
	}

	namespace InterfaceMarker {
	}

	/**
	 * JSX namespace
	 */
	export namespace JSX {
		export import Element = Self.VDomElement;

	}

	/**
	 * JSX route component
	 */
	export function JsxRoute(props?: {path?: string; exact?: boolean}): Self.JSX.Element;

	/**
	 * Key codes
	 */
	export enum KeyCode {
		BACKSPACE,
		TAB,
		ENTER,
		SHIFT,
		CTRL,
		ALT,
		PAUSE,
		CAPSLOCK,
		ESCAPE,
		SPACE,
		PAGE_UP,
		PAGE_DOWN,
		END,
		HOME,
		ARROW_LEFT,
		ARROW_RIGHT,
		ARROW_UP,
		ARROW_DOWN,
		PRINT_SCREEN,
		INSERT,
		DELETE,
		A,
		B,
		C,
		D,
		E,
		F,
		G,
		H,
		I,
		J,
		K,
		L,
		M,
		N,
		O,
		P,
		Q,
		R,
		S,
		T,
		U,
		V,
		W,
		X,
		Y,
		Z,
		META,
		META_LEFT,
		META_RIGHT,
		CONTEXT_MENU,
		NUM_0,
		NUM_1,
		NUM_2,
		NUM_3,
		NUM_4,
		NUM_5,
		NUM_6,
		NUM_7,
		NUM_8,
		NUM_9,
		NUM_MUL,
		NUM_ADD,
		NUM_SUB,
		NUM_DECIMAL,
		NUM_DIV,
		F1,
		F2,
		F3,
		F4,
		F5,
		F6,
		F7,
		F8,
		F9,
		F10,
		F11,
		F12,
		NUM_LOCK,
		SCROLL_LOCK,
		SEMICOLON,
		EQUAL,
		COMMA,
		DASH,
		PERIOD,
		SLASH,
		BACK_QUOTE,
		BRACKET_LEFT,
		BACK_SLASH,
		BRACKET_RIGHT,
		SINGLE_QUOTE,
	}

	/**
	 * Handles keyboard messages with registered actions
	 */
	export class KeyHandler {
		/**
		 * Adds new key action to collection
		 */
		add(keyStroke: (Self.KeyStroke.Source | Self.KeyShortcut), action: Self.KeyShortcut.ActionCallback): object;

		/**
		 * Removes key action from collection
		 */
		remove(shortcut: Self.KeyShortcut): void;

		/**
		 * Triggers first action that match provided message
		 */
		handle(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): boolean;

	}

	export namespace KeyHandler {
	}

	/**
	 * Keyboard shortcut
	 */
	export class KeyShortcut {
		/**
		 * Constructor
		 */
		constructor(options: {keyStroke: Self.KeyStroke; action: Self.KeyShortcut.ActionCallback});

		keyStroke: Self.KeyStroke;

		action: Self.KeyShortcut.ActionCallback;

		/**
		 * Handles message - returns true if the message is handled
		 */
		handle(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): boolean;

		/**
		 * Tests if message match the shortcut
		 */
		match(message: Self.KeyboardMessage): boolean;

		/**
		 * Creates shortcut
		 */
		static create(keyStroke: Self.KeyStroke.Source, action: Self.KeyShortcut.ActionCallback): Self.KeyShortcut;

	}

	export namespace KeyShortcut {
		type ActionCallback = (message: Self.KeyboardMessage, result: Self.RoutedMessage.Result) => boolean;

	}

	/**
	 * Key stroke
	 */
	export class KeyStroke {
		constructor(options?: Self.KeyStroke.Options);

		/**
		 * Keycode part of keystroke
		 */
		keyCode: Self.KeyCode;

		/**
		 * Key part of keystroke
		 */
		key: string;

		/**
		 * Indicates modifier keys state
		 */
		modifier: Self.KeyboardMessage.Modifier;

		/**
		 * Hash of keystroke
		 */
		hash: Self.KeyStrokeHash;

		/**
		 * Check if
		 */
		match(message: Self.KeyboardMessage): void;

		/**
		 * Serialize stroke to string in format '<modifier>+<modifier>+<key>'
		 */
		toString(): string;

		/**
		 * Create keyStroke from string in format '<modifier>+<modifier>+<key>'
		 */
		static fromString(str: string, options?: Self.KeyStroke.Options): Self.KeyStroke;

		/**
		 * Create keystroke from array of keys
		 */
		static fromKeys(keys: globalThis.Array<(string | Self.KeyCode)>, options?: Self.KeyStroke.Options): Self.KeyStroke;

		/**
		 * KeyStroke factory function
		 */
		static create(options: Self.KeyStroke.Source): Self.KeyStroke;

	}

	export namespace KeyStroke {
		interface Options {
			keyCode?: Self.KeyCode;

			key?: string;

			modifier: Self.KeyboardMessage.Modifier;

		}

		/**
		 * Source of KeyStroke
		 */
		type Source = (Self.KeyStroke | Self.KeyStroke.Options | string | globalThis.Array<(string | Self.KeyCode)>);

	}

	/**
	 * Key stroke hash
	 */
	export class KeyStrokeHash {
		constructor(options: {keyCode: Self.KeyCode; key: string; modifier: Self.KeyboardMessage.Modifier});

		/**
		 * Match another hash
		 */
		match(hash: Self.KeyStrokeHash): boolean;

	}

	export namespace KeyStrokeHash {
	}

	export class KeyboardMessage extends Self.RoutedMessage {
		/**
		 * Constructs KeyboardMessage
		 */
		constructor(options: Self.KeyboardMessage.Options);

		/**
		 * Target element of source event
		 */
		element: Element;

		/**
		 * Character of pressed key (if has any)
		 */
		char: string;

		/**
		 * The value of the key pressed by the user
		 */
		key: string;

		/**
		 * Number representing a system and implementation dependent numerical code identifying the unmodified value of the pressed key
		 */
		keyCode: number;

		/**
		 * The Unicode value of a character key
		 */
		charCode: number;

		/**
		 * Indicates modifier keys state
		 */
		modifier: Self.KeyboardMessage.Modifier;

		/**
		 * Hash of this message
		 */
		hash: Self.KeyStrokeHash;

		static fromEvent(event: KeyboardEvent): Self.KeyboardMessage;

		static getModifier(): void;

	}

	export namespace KeyboardMessage {
		interface Modifier {
			ctrl: boolean;

			alt: boolean;

			shift: boolean;

			meta: boolean;

			none: boolean;

		}

		interface Options extends Self.RoutedMessage.Options {
			element: Element;

			char: string;

			key: string;

			keyCode: number;

			charCode: number;

			modifier: Self.KeyboardMessage.Modifier;

		}

	}

	/**
	 * Lazily loaded data source wrapper
	 */
	export class LazyDataSource implements Self.DataSource, Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructor
		 */
		constructor(provider: Self.LazyDataSource.Provider);

		/**
		 * The wrapped lazy loaded data source
		 */
		dataSource: (Self.DataSource | null);

		/**
		 * True if the data source has been loaded
		 */
		loaded: boolean;

		/**
		 * Query data source items
		 */
		query(args: Self.DataSource.QueryArguments, onResult: (args: {items: globalThis.Array<any>}) => void, onError?: (error: any) => void): void;

		/**
		 * Returns a new LazyDataSource with a transformation applied on the lazy loaded data source
		 */
		transform(transform: (item: any) => any): Self.LazyDataSource;

		/**
		 * Returns a filtered LazyDataSource by applying the filter operation to the lazy loaded data source
		 */
		filter(predicate: (item: any) => boolean): Self.LazyDataSource;

		/**
		 * Returns a new transformed lazy data source
		 */
		map(transform: (item: any, index: number) => any): Self.LazyDataSource;

		/**
		 * Returns a new sorted lazy data source
		 */
		sort(comparator: (left: any, right: any) => number): Self.LazyDataSource;

		/**
		 * Force load the wrapped data source
		 */
		load(): globalThis.Promise<Self.DataSource>;

	}

	export namespace LazyDataSource {
		type Provider = () => (globalThis.Array<any> | Self.DataSource | globalThis.Promise<(globalThis.Array<any> | Self.DataSource)>);

	}

	/**
	 * Logger
	 */
	export namespace Log {
		/**
		 * Log at specific level
		 */
		function log(level: Self.LogLevel, ...message: globalThis.Array<any>): void;

		/**
		 * Log at error level
		 */
		function error(...args: globalThis.Array<any>): void;

		/**
		 * Log at warning level
		 */
		function warning(...args: globalThis.Array<any>): void;

		/**
		 * Log a warning message once
		 */
		function warningOnce(message: string): void;

		/**
		 * Log at info level
		 */
		function info(...args: globalThis.Array<any>): void;

		/**
		 * Log at debug level
		 */
		function debug(...args: globalThis.Array<any>): void;

		/**
		 * Log at trace level
		 */
		function trace(...args: globalThis.Array<any>): void;

		/**
		 * Log deprecation
		 */
		function deprecation(message: string, version: Self.ReleaseVersion, link?: string): void;

	}

	/**
	 * Log category
	 */
	export enum LogCategory {
		GLOBAL,
		DEPRECATION,
	}

	export class LogFormatter implements Self.NotificationFormatter {
		/**
		 * Constructs LogFormatter
		 */
		constructor();

		showTime: boolean;

		showLevel: boolean;

		showStack: boolean;

		showUrl: boolean;

		format(notification: object): globalThis.Array<any>;

		/**
		 * Convert arbitrary value to string
		 */
		static stringifyValue(obj: any): string;

		/**
		 * Convert time to locale string
		 */
		static timeToLocaleString(time: Self.Date): string;

		/**
		 * Get log level string
		 */
		static getLevelString(level: Self.LogLevel): string;

		/**
		 * Converts a stack array to a string
		 */
		static getStackString(stack: string): string;

	}

	export namespace LogFormatter {
	}

	export enum LogLevel {
		ALL,
		TRACE,
		DEBUG,
		INFO,
		WARNING,
		ERROR,
		NONE,
	}

	/**
	 * Log reporter
	 */
	export class LogReporter implements Self.EventBusListener {
		/**
		 * Constructs LogReporter
		 */
		constructor();

		threshold: Self.LogLevel;

		/**
		 * Whether a stack trace should be saved. Use this options for debugging purposes only as it may have a negative impact on performance. This does not work in IE10.
		 */
		captureStackTrace: boolean;

		/**
		 * Reports a message to a specific output
		 */
		process(notification: {category: Self.LogCategory; level: Self.LogLevel; message: string; time: Self.Date}): void;

		/**
		 * Sets a specific notification formatter
		 */
		setFormatter(formatter: Self.NotificationFormatter): void;

		/**
		 * Preprocess input args
		 */
		protected _preprocess(): object;

	}

	export namespace LogReporter {
	}

	/**
	 * Logging context
	 */
	export class LoggingContext {
		/**
		 * Constructor
		 */
		constructor(options?: {reporters?: object});

		/**
		 * Start listening
		 */
		attach(): void;

		/**
		 * Stop listening
		 */
		detach(): void;

		/**
		 * Log message
		 */
		log(level: Self.LogLevel, ...message: globalThis.Array<any>): void;

		/**
		 * Get reporter
		 */
		getReporter(reporter: string): any;

		/**
		 * Create a default LoggingContext based on debug settings
		 */
		static default(debug: object, extraReporters?: object): Self.LoggingContext;

		/**
		 * Create a LoggingContext that logs to console only
		 */
		static console(): Self.LoggingContext;

		/**
		 * Create a logging context that does not do any logging
		 */
		static none(): Self.LoggingContext;

	}

	export namespace LoggingContext {
	}

	/**
	 * LRU cache
	 */
	export class LruCache {
		/**
		 * Constructor
		 */
		constructor(maxSize?: number);

		/**
		 * Get the cache size
		 */
		size: number;

		/**
		 * Check if the cache contains the key
		 */
		has(key: any): boolean;

		/**
		 * Get value for the key. Does NOT update the "recently used"-ness of the key.
		 */
		peek(key: any): any;

		/**
		 * Get value for the key and mark it as recently used.
		 */
		get(key: any): any;

		/**
		 * Set or update the value for a key and mark it as recently used.
		 */
		set(key: any, value: any): Self.LruCache;

		/**
		 * Delete the key from the cache.
		 */
		delete(key: any): Self.LruCache;

		/**
		 * Clear the cache
		 */
		clear(): Self.LruCache;

		/**
		 * Remove last recently used item from the cache
		 */
		private _removeLast(): void;

	}

	export namespace LruCache {
	}

	/**
	 * Map class based on the native browser Map
	 * @deprecated Use the native Map
	 */
	export class Map {
		/**
		 * Constructor
		 */
		constructor(iterable?: globalThis.Array<any>);

		/**
		 * Get iterator
		 */
		[Symbol.iterator](): any;

		/**
		 * Get map size
		 */
		size: number;

		/**
		 * Is the map empty
		 */
		empty: boolean;

		/**
		 * Get the oldest key in the map
		 */
		firstKey: any;

		/**
		 * Get a list of map keys in insertion order
		 */
		keys: globalThis.Array<any>;

		/**
		 * Get a list of map values in insertion order
		 */
		values: globalThis.Array<any>;

		/**
		 * Get a list of map entries in insertion order
		 */
		entries: globalThis.Array<any>;

		/**
		 * Associate key with value
		 */
		set(key: any, value: any): globalThis.Map<any, any>;

		/**
		 * Get value associated with given key
		 */
		get(key: any): any;

		/**
		 * Remove given key from the map
		 */
		delete(key: any): globalThis.Map<any, any>;

		/**
		 * Check if key is present in the map
		 */
		has(key: any): boolean;

		/**
		 * Clear the map
		 */
		clear(): globalThis.Map<any, any>;

		/**
		 * Execute callback for every map entry
		 */
		forEach(callback: (value: any, key: any, map: globalThis.Map<any, any>) => void, context?: any): void;

		/**
		 * Create a Map from an array
		 */
		static fromArray(array: globalThis.Array<any>, splitter?: (item: any) => ({key: string; value: any} | null)): globalThis.Map<any, any>;

	}

	export namespace Map {
	}

	/**
	 * MarkdownService used to format text
	 */
	export class MarkdownService {
		/**
		 * Constructs MarkdownService
		 */
		constructor(options?: Self.MarkdownService.Options);

		/**
		 * Sets function that creates link representation in markup
		 */
		setCreateLink(createLinkFactory: (args: object) => Self.JSX.Element): void;

		/**
		 * Sets function that creates text representation in markup
		 */
		setCreateText(createTextFactory: (args: object) => Self.JSX.Element): void;

		/**
		 * Sets formatted text content
		 */
		formatText(text: (string | number | Self.Translation), options?: {linkOptions?: PackageComponent.Link.Options; textOptions?: PackageComponent.Text.Options}): globalThis.Array<object>;

		private _formatStyle(): void;

		private _formatLink(): void;

		private _matchBoldGroup(): void;

		private _matchItalicGroup(): void;

		private _matchLinkGroup(): void;

		private _replaceMarkupWithSubstitutes(): void;

		private _replaceBoldWithSubstitute(): void;

		private _replaceItalicWithSubstitute(): void;

		private _replaceEscapedCharsWithAscii(): void;

		private _revertToChars(): void;

	}

	export namespace MarkdownService {
		interface Text {
			bold?: boolean;

			italic?: boolean;

			text?: string;

		}

		interface Link {
			content?: string;

			url?: string;

		}

		interface Options extends Self.Component.Options {
			createLink?: (args: object) => Self.JSX.Element;

			createText?: (args: object) => Self.JSX.Element;

		}

	}

	/**
	 * Message code.
	 */
	export enum MessageCode {
		KEY_DOWN,
		KEY_UP,
		KEY_PRESS,
		CLICK,
		DOUBLE_CLICK,
		FOCUS_IN,
		FOCUS_OUT,
		PASTE,
		CUT,
		SELECT,
		INPUT,
		WHEEL,
		CONTEXT_MENU,
		SCROLL,
		POINTER_ENTER,
		POINTER_OVER,
		POINTER_DOWN,
		POINTER_MOVE,
		POINTER_UP,
		POINTER_LEAVE,
		POINTER_OUT,
	}

	/**
	 * Message handler.
	 */
	export interface MessageHandler {
		/**
		 * Process message.
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace MessageHandler {
	}

	/**
	 * Mixin class
	 */
	export class Mixin extends Self.MixinMarker {
		/**
		 * Constructor
		 */
		constructor(definition: Self.Mixin.Options);

		/**
		 * Create new mixin
		 */
		static create(definition: object): Self.Mixin;

	}

	export namespace Mixin {
		interface Options {
			methods?: object;

			properties?: object;

			name?: string;

		}

	}

	/**
	 * Marker object for mixins
	 */
	class MixinMarker {
	}

	namespace MixinMarker {
	}

	/**
	 * Mouse buttons identifiers
	 */
	export enum MouseButton {
		LEFT,
		MIDDLE,
		RIGHT,
	}

	/**
	 * Mutable data source interface
	 */
	export interface MutableDataSource extends Self.DataSource {
		/**
		 * Adds items to the collection
		 */
		add(args: {parent?: any; item?: any; items?: globalThis.Array<any>; index?: number; reason?: string}): object;

		/**
		 * Remove items from the collection
		 */
		remove(args: {parent?: any; item?: any; items?: globalThis.Array<any>; index?: number; count?: number; reason?: string}): object;

		/**
		 * Change order of elements in the collection. Moves a chunk of items from one position to another.
		 */
		move(args: {sourceParent?: number; sourceIndex: number; targetParent?: number; targetIndex: number; count?: number; reason?: string}): object;

	}

	export namespace MutableDataSource {
	}

	/**
	 * Navigator using the pathname part of the URL
	 */
	export class Navigator {
		/**
		 * Constructor
		 */
		constructor(options: {getLocation: () => Self.Navigator.GetLocationResult; constructUrl: (route: string, params: object) => string});

		/**
		 * Get current location
		 */
		location: string;

		/**
		 * Get current search part of the URL
		 */
		search: string;

		/**
		 * Get the hash part of the URL
		 */
		hash: string;

		/**
		 * Construct url for a given route and parameters
		 */
		constructUrl(route: string, params?: object): string;

		/**
		 * Check if current location matches a given route
		 */
		recognizeRoute(route: string, options?: {exact?: boolean}): object;

		/**
		 * Attach the navigator
		 */
		listen(callback: (args: {location: string; search: string; hash: string}) => void): () => void;

		/**
		 * Navigate to route creating a new history entry
		 */
		push(route: string, params?: object): void;

		/**
		 * Navigate to route replacing the current history entry
		 */
		replace(route: string, params: object): void;

		/**
		 * Go forward or backward in history
		 */
		go(index: number): void;

		/**
		 * Go back in history
		 */
		back(): void;

		/**
		 * Go forward in history
		 */
		forward(): void;

		/**
		 * Construct a path navigator
		 */
		static path(options?: {basename?: string}): Self.Navigator;

		/**
		 * Construct a hash navigator
		 */
		static hash(): Self.Navigator;

		/**
		 * Construct a parameter navigator
		 */
		static param(options: {name: string}): Self.Navigator;

	}

	export namespace Navigator {
		interface GetLocationResult {
			location: string;

			hash: string;

			search: string;

		}

	}

	export class NoneLogFormatter extends Self.LogFormatter {
		/**
		 * Constructs NoneLogFormatter
		 */
		constructor();

	}

	export namespace NoneLogFormatter {
	}

	/**
	 * Notification formatter
	 */
	export interface NotificationFormatter {
		format(notification: object): globalThis.Array<any>;

	}

	export namespace NotificationFormatter {
	}

	/**
	 * Notification service
	 */
	export const NotificationService: Self.EventBus;

	/**
	 * Utility functions for numbers
	 */
	export namespace Number {
		/**
		 * Checks whether given number is between given range ( rangeStart <= number <= rangeEnd).
		 */
		function isBetween(number: number, rangeStart: number, rangeEnd: number): boolean;

		/**
		 * Checks that index is a valid index for an array of a given size, i.e., that it is in the range [0, size)
		 */
		function isValidIndex(index: number, size: number): boolean;

		/**
		 * Test that value is a valid finite number (number that is not NaN and not infinite)
		 */
		function isFinite(value: any): boolean;

		/**
		 * Test that value is NaN
		 */
		function isNaN(value: any): boolean;

		/**
		 * Test that value is positive or negative infinity
		 */
		function isInfinity(value: any): boolean;

		/**
		 * Restrict number to a given interval
		 */
		function toBounds(number: number, min: number, max: number): number;

		/**
		 * Generate a random integer from a given range
		 */
		function randomInteger(min: number, max: number): number;

		/**
		 * Returns a random integer from the range 0..length-1
		 */
		function randomIndex(length: number): number;

		/**
		 * Compare two numbers
		 */
		function compare(left: number, right: number, ascending?: boolean): number;

		/**
		 * Check if number is a power of 2. Works only for positive integers.
		 */
		function isPowerOf2(number: number): boolean;

		/**
		 * Convert value to a number
		 */
		function of(value: any): number;

		/**
		 * Check if value is an integer
		 */
		function isInteger(value: any): boolean;

		/**
		 * Convert a string to a number. Returns NaN when the input is not a number.
		 */
		function parse(value: string): number;

	}

	/**
	 * Provides basic object introspection and extension methods
	 */
	export namespace Object {
		/**
		 * Shallow extend of target object with properties from one or more source objects
		 */
		function extend(target: object, ...sources: globalThis.Array<object>): object;

		/**
		 * Deep extend of target object with properties from one or more source objects
		 */
		function deepExtend(target: object, ...sources: globalThis.Array<object>): object;

		/**
		 * Shallow object copy
		 */
		function copy(source: (object | globalThis.Array<any>)): object;

		/**
		 * Copy object including symbol keys
		 */
		function copyWithSymbols(source: object): void;

		/**
		 * Shallow copy of object properties matching predicate
		 */
		function copyIf(source: (object | globalThis.Array<any>), predicate: (key: string, value: any) => boolean): object;

		/**
		 * Create deep object copy
		 */
		function deepCopy(source: object, maxLevel?: number): void;

		/**
		 * Copy object properties that match the predicate
		 */
		function filter(source: object, filter: (key: string, value: any) => boolean): object;

		/**
		 * Recursively checks that the first object contains all properties of the second one and that these properties have the same values.
		 */
		function deepContains(left: any, right: any): boolean;

		/**
		 * Deep comparison of two objects
		 */
		function equals(left: any, right: any): boolean;

		/**
		 * Shallow comparison of two objects
		 */
		function shallowEquals(left: (object | null), right: (object | null)): boolean;

		/**
		 * Returns true if the object has no own property
		 */
		function isEmpty(object: object): boolean;

		/**
		 * Return a unique ID for an object
		 */
		function guid(object: object): number;

		/**
		 * Generate a unique id
		 */
		function nextGuid(): number;

		/**
		 * Define property on object
		 */
		function defineProperty(): void;

		/**
		 * Define properties on object
		 */
		function defineProperties(): void;

		/**
		 * Freeze object
		 */
		function freeze(object: object): object;

		/**
		 * Deep freeze object
		 */
		function deepFreeze(object: object): object;

		/**
		 * Check if object is frozen
		 */
		function isFrozen(object: object): boolean;

		/**
		 * Get own property names
		 */
		function getOwnPropertyNames(): void;

		/**
		 * Get own property descriptor
		 */
		function getOwnPropertyDescriptor(): void;

		/**
		 * Get own property descriptors
		 */
		function getOwnPropertyDescriptors(): void;

		/**
		 * Get own property symbols
		 */
		function getOwnPropertySymbols(): void;

		/**
		 * Returns an array of object keys
		 */
		function keys(object: object): globalThis.Array<string>;

		/**
		 * Returns an array of object keys including symbols
		 */
		function keysWithSymbols(source: object): globalThis.Array<(string | symbol)>;

		/**
		 * Merge objects
		 */
		function assign(...object: globalThis.Array<object>): object;

		/**
		 * Get object prototype
		 */
		function getPrototypeOf(object: object): (object | null);

		/**
		 * Recursively find property descriptor on the object or its prototypes
		 */
		function getPropertyDescriptor(object: object, propertyName: string): (object | null);

		/**
		 * Returns an array of object values
		 */
		function values(object: object): globalThis.Array<any>;

		/**
		 * Return object entries as an array of key/value pairs.
		 */
		function entries(object: object): globalThis.Array<[string, any]>;

		/**
		 * Return object entries including symbols as an array of key/value pairs.
		 */
		function entriesWithSymbols(source: object): globalThis.Array<[(string | symbol), any]>;

		/**
		 * Create a new object from entries
		 */
		function fromEntries(iterable: Iterable<[string, any]>): object;

		/**
		 * Create a new object with the specified prototype and properties
		 */
		function create(prototype: object, properties?: object): object;

		/**
		 * Compare values
		 */
		function is(left: any, right: any): boolean;

		/**
		 * Convert a value to string
		 */
		function toString(value: any): string;

		/**
		 * Get value from nested object
		 */
		function getValue(context: object, path: (string | globalThis.Array<string>), defaultValue?: any): any;

		/**
		 * Set value of nested object
		 */
		function setValue(context: object, path: (string | globalThis.Array<string>), value: any, pathCreator?: (context: object, property: string) => object): void;

		/**
		 * Compare values at path
		 */
		function compareValues(left: object, right: object, path: (string | globalThis.Array<string>), comparator?: (left: any, right: any) => boolean): boolean;

		/**
		 * Creates a new object with the same keys but values mapped using the mapper function
		 */
		function mapValues(input: object, mapper: (value: any, key: string, input: object) => any): void;

		/**
		 * Get object symbol keys
		 */
		function symbolKeys(object: object): globalThis.Array<symbol>;

		/**
		 * Get object symbol values
		 */
		function symbolValues(object: object): globalThis.Array<any>;

		/**
		 * Get object symbol entries
		 */
		function symbolEntries(object: object): globalThis.Array<[symbol, any]>;

		/**
		 * Check if object has own property. Avoids the problem with hasOwnProperty being overridden.
		 */
		function hasOwnProperty(object: object, propertyName: string): boolean;

		/**
		 * Empty object constant
		 */
		const EMPTY: object;

	}

	/**
	 * Opaque focus handler
	 */
	class OpaqueFocusHandler {
		/**
		 * Constructs OpaqueFocusHandler
		 */
		constructor(args: {component?: Self.Component; handler?: Self.FocusHandler});

		/**
		 * True if the component is focusable
		 */
		effectiveFocusable: boolean;

		/**
		 * True if the component can be focusable
		 */
		focusable: boolean;

		/**
		 * True if the component is tabbable
		 */
		effectiveTabbable: boolean;

		/**
		 * True if the component can be tabbable
		 */
		tabbable: boolean;

		/**
		 * Current focus target component
		 */
		focusComponent: Self.Component;

		/**
		 * Updates handler
		 */
		update(): void;

		/**
		 * Focuses
		 */
		focus(): any;

		/**
		 * Check if focused
		 */
		isFocused(focusComponent: Self.Component): boolean;

		/**
		 * Wrap focus handler of a child component
		 */
		static wrap(parent: Self.Component, child: Self.Component): Self.OpaqueFocusHandler;

	}

	namespace OpaqueFocusHandler {
	}

	/**
	 * Page
	 */
	export class Page {
		/**
		 * Constructor
		 */
		constructor(options?: Self.Page.Options);

		/**
		 * The root context
		 */
		context: Self.Context;

		/**
		 * Shell reference
		 */
		shell: PackageComponent.Shell;

		/**
		 * Context services
		 */
		services: Self.HierarchicalMap;

		/**
		 * Starts the main page routine
		 */
		run(): void;

	}

	export namespace Page {
		interface Options {
			context?: Self.Context;

			shell?: PackageComponent.Shell;

		}

	}

	/**
	 * Page message dispatcher
	 */
	export class PageMessageDispatcher {
		/**
		 * Constructor
		 */
		constructor(options: object);

		/**
		 * Adds filter on begin of filters queue
		 */
		registerFilter(handler: (Self.RoutedMessage.Filter | Self.MessageHandler)): {remove: () => void};

		/**
		 * Listen on element on events
		 */
		attach(eventDispatcher?: HTMLElement): {remove: () => void};

		/**
		 * Stop listening on an element
		 */
		detach(eventDispatcher: HTMLElement): void;

		/**
		 * Disposes page message dispatcher
		 */
		dispose(): void;

		/**
		 * Sends the message to the recipient along a path consisting of all its ancestors in the virtual DOM
		 */
		postMessage(message: Self.RoutedMessage): void;

		/**
		 * Create message route
		 */
		private createMessageRoute(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		/**
		 * Creates main message chain
		 */
		protected getMessageHandlers(message: Self.RoutedMessage): globalThis.Array<Self.MessageHandler>;

		/**
		 * Hook to browser events
		 */
		private hookOnEventDispatcher(): void;

		/**
		 * Unhook from browser events
		 */
		private unhookFromEventDispatcher(): void;

		/**
		 * List of events handled by PageMessageDispatcher.
		 */
		static HandledEvents: globalThis.Array<string>;

	}

	export namespace PageMessageDispatcher {
	}

	/**
	 * Parameter based router
	 */
	export function ParamRouter(props: {name: string}): Self.JSX.Element;

	/**
	 * Path based router
	 */
	export function PathRouter(props?: {basename?: string}): Self.JSX.Element;

	export class PersistingFormatter extends Self.LogFormatter {
		/**
		 * Constructs PersistingFormatter
		 */
		constructor();

	}

	export namespace PersistingFormatter {
	}

	export class PersistingReporter extends Self.LogReporter {
		/**
		 * Constructs PersistingReporter
		 */
		constructor();

		/**
		 * Get all messages stored in all instances of PersistingReporter
		 */
		getMessages(): globalThis.Array<any>;

		/**
		 * Get all messages stored in all instances of PersistingReporter
		 */
		getDeprecations(): globalThis.Array<any>;

		/**
		 * Check if any deprecation has been reported
		 */
		hasDeprecations(): boolean;

		/**
		 * Delete all stored messages
		 */
		clear(): void;

		/**
		 * Get all messages stored in all instances of PersistingReporter. This static method is used in automation framework
		 */
		static getMessages(): globalThis.Array<any>;

		static Event: Self.PersistingReporter.EventTypes;

	}

	export namespace PersistingReporter {
		interface EventTypes {
			STORAGE_CHANGED: string;

		}

	}

	export class PointerMessage extends Self.RoutedMessage {
		/**
		 * Constructs PointerMessage
		 */
		constructor(options: Self.PointerMessage.Options);

		/**
		 * Target element of source event
		 */
		element: Element;

		/**
		 * Related element of source event
		 */
		relatedElement: Element;

		/**
		 * Button state
		 */
		button: Self.PointerMessage.Button;

		/**
		 * Indicates modifier buttons state
		 */
		modifier: Self.KeyboardMessage.Modifier;

		/**
		 * Position of pointer according to element, document and screen
		 */
		position: Self.PointerMessage.Position;

		/**
		 * Indicates change of position of wheel device
		 */
		wheel: Self.PointerMessage.Wheel;

		/**
		 * Indicates change of position of pointer from last message
		 */
		movement: Self.PointerMessage.Movement;

		/**
		 * A unique identifier for the pointer
		 */
		pointerId: string;

		/**
		 * Indicates type of pointer
		 */
		pointerType: Self.PointerMessage.PointerType;

		clone(options: object): Self.PointerMessage;

		static fromEvent(event: PointerEvent, options?: object): Self.PointerMessage;

		static fromMouseEvent(event: MouseEvent, type?: Self.PointerMessage.PointerType): Self.PointerMessage;

		static getPosition(): void;

		static getButton(): void;

		static getWheel(): void;

		static getMovement(): void;

	}

	export namespace PointerMessage {
		interface Position {
			element: Self.PointerMessage.Coordinates;

			document: Self.PointerMessage.Coordinates;

			client: Self.PointerMessage.Coordinates;

		}

		/**
		 * Pointer message position
		 */
		interface Coordinates {
			x: number;

			y: number;

		}

		interface Button {
			primary: boolean;

			secondary: boolean;

			auxiliary: boolean;

			none: boolean;

		}

		interface Movement {
			dx: number;

			dy: number;

		}

		interface Wheel {
			dx: number;

			dy: number;

		}

		interface Options extends Self.RoutedMessage.Options {
			element: Element;

			relatedElement: Element;

			button: Self.PointerMessage.Button;

			modifier: Self.KeyboardMessage.Modifier;

			position: Self.PointerMessage.Position;

			wheel: Self.PointerMessage.Wheel;

			movement: Self.PointerMessage.Movement;

			pointerId: string;

			pointerType: Self.PointerMessage.PointerType;

		}

		enum PointerType {
			MOUSE,
			PEN,
			TOUCH,
			UNKNOWN,
		}

	}

	interface Portal {
		/**
		 * Owner component
		 */
		owner: (Self.Component | Self.VDomRef | null);

	}

	namespace Portal {
	}

	/**
	 * Helper for getting position of frame
	 */
	export class PositionHelper {
		/**
		 * Return absolute position in container corresponding with specified element or point on the page.
		 */
		static getPosition(options: Self.PositionHelper.Options): Self.PositionHelper.FrameDescription;

		/**
		 * Go through all allowed positions and get the most appropriate
		 */
		private static _choosePosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		/**
		 * Go through all allowed positions on screen and get the most appropriate
		 */
		private static _chooseScreenPosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		/**
		 * Go through all allowed positions on target and get the most appropriate
		 */
		private static _chooseTargetPosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		/**
		 * Use the given strategy for positioning frame
		 */
		private static _useStrategy(basePointPosition: Self.PositionHelper.Point, frameDescription: Self.PositionHelper.FrameDescription, result: Self.PositionHelper.BestResult, options: Self.PositionHelper.HelperOptions): void;

		/**
		 * Shift the computed position of frame on the screen to fit the frame. Keeps the place but ignores alignment.
		 */
		private static _shiftFrame(frameDescription: Self.PositionHelper.FrameDescription, outerFrame: Self.PositionHelper.Coordinates): void;

		/**
		 * Get all alignments from options which can be used for specified placement
		 */
		private static _getAvailableAlignments(placement: string, options: Self.PositionHelper.HelperOptions): globalThis.Array<Self.PositionHelper.Alignment>;

		/**
		 * Compute base coordinates point Base point is the origin place, where is applied the position and alignment
		 */
		private static _getBasePointCoordinates(elementBox: Self.PositionHelper.Coordinates, position: {placement: Self.PositionHelper.Placement; alignment: Self.PositionHelper.Alignment}, userOffset: Self.PositionHelper.Offset): Self.PositionHelper.Point;

		/**
		 * Compute final position (top, left) in given frame.
		 */
		private static _getFramePosition(size: Self.PositionHelper.Size, basePosition: Self.PositionHelper.Point, place: {placement: Self.PositionHelper.Placement; alignment: Self.PositionHelper.Alignment}): Self.Rectangle;

		/**
		 * Compute alternate size which can fit into parent frame and does not break a minimum size limit
		 */
		private static _reduceSize(visibleFrame: Self.PositionHelper.Coordinates, size: Self.PositionHelper.Size, frameDescription: Self.PositionHelper.FrameDescription, centerPoint: Self.PositionHelper.Point): Self.PositionHelper.Size;

		/**
		 * Concatenate allowed position with placement position. placement positions get first.
		 */
		private static _concatAllowedPositions(options: Self.PositionHelper.HelperOptions): globalThis.Array<Self.PositionHelper.Placement>;

		/**
		 * Frame into the outer frame - window - must fit
		 */
		static getOuterFramePosition(frame: (HTMLElement | PackageComponent.Window)): Self.Rectangle;

		/**
		 * Initialize frame parameters with default values for undefined properties.
		 */
		private static _initializeOptions(options: Self.PositionHelper.Options): Self.PositionHelper.HelperOptions;

		private static _getBox(target: (Self.Rectangle | Element | object)): Self.Rectangle;

		/**
		 * Initialize size options. If string size or string px size is provided, the value is converted into number.
		 */
		private static _initializeSizes(options: object): Self.PositionHelper.SizeOptions;

		/**
		 * Default placement of the frame according to the target element (position of main axis).
		 */
		static DEFAULT_PLACEMENT: globalThis.Array<Self.PositionHelper.Placement>;

		/**
		 * Default alignment of the frame according to the target element (position of the cross axis).
		 */
		static DEFAULT_ALIGNMENT: globalThis.Array<Self.PositionHelper.Alignment>;

		/**
		 * Default frame size.
		 */
		static DEFAULT_SIZE: Self.PositionHelper.SizeOptions;

	}

	export namespace PositionHelper {
		interface Coordinates extends Self.Rectangle {
		}

		interface SizeOptions {
			height: number;

			maxHeight: number;

			maxWidth: number;

			minHeight: number;

			minWidth: number;

			width: number;

		}

		interface Options {
			alignment?: (Self.PositionHelper.Alignment | globalThis.Array<Self.PositionHelper.Alignment>);

			alignmentOffset?: number;

			allowed?: (Self.PositionHelper.Placement | globalThis.Array<Self.PositionHelper.Placement>);

			allowOverlapOuterContainer?: boolean;

			outerContainer?: (HTMLElement | Self.Rectangle);

			placement?: (Self.PositionHelper.Placement | globalThis.Array<Self.PositionHelper.Placement>);

			placementOffset?: number;

			rtl?: boolean;

			size?: Self.PositionHelper.SizeOptions;

			strategy?: Self.PositionHelper.Strategy;

			target?: (string | HTMLElement | Self.PositionHelper.Point | Self.Rectangle);

		}

		interface Size {
			height: number;

			width: number;

		}

		interface Info {
			passed: boolean;

			placement: (string | globalThis.Array<string>);

			alignment: (string | globalThis.Array<string>);

		}

		interface FrameDescription {
			position: Self.Rectangle;

			targetBox: Self.Rectangle;

			info: Self.PositionHelper.Info;

		}

		interface BestResult {
			frameDescription: Self.PositionHelper.FrameDescription;

			fitting: number;

			original: boolean;

		}

		interface Point {
			left: number;

			top: number;

		}

		interface Offset {
			place: number;

			align: number;

		}

		interface HelperOptions {
			allowed: (Self.PositionHelper.Placement | globalThis.Array<Self.PositionHelper.Placement>);

			placement: (Self.PositionHelper.Placement | globalThis.Array<Self.PositionHelper.Placement>);

			alignment: (Self.PositionHelper.Alignment | globalThis.Array<Self.PositionHelper.Alignment>);

			size: Self.PositionHelper.SizeOptions;

			frameSize?: Self.PositionHelper.SizeOptions;

			frameDescription?: Self.PositionHelper.FrameDescription;

			target: (string | HTMLElement | Self.PositionHelper.Point);

			outerFrame: Self.PositionHelper.Coordinates;

			targetBox: Self.PositionHelper.Coordinates;

			strategy: Self.PositionHelper.Strategy;

			alignmentOffset?: number;

			placementOffset?: number;

		}

		/**
		 * Strategy of position the frame to fit inside the screen
		 */
		enum Strategy {
			SIZE,
			POSITION,
			SHIFT,
		}

		/**
		 * Placement of the frame according to the target element (position of main axis).
		 */
		enum Placement {
			OVER,
			ALL,
			ABOVE,
			BELOW,
			LEFT,
			RIGHT,
		}

		/**
		 * Alignment of the frame according to the target element (position of the cross axis).
		 */
		enum Alignment {
			LEFT,
			RIGHT,
			CENTER_HORIZONTAL,
			CENTER_VERTICAL,
			TOP,
			BOTTOM,
			CORNER_LEFT,
			CORNER_RIGHT,
		}

		/**
		 * Screen position
		 */
		enum ScreenPosition {
			SCREEN_CENTER,
		}

	}

	/**
	 * Preferences
	 */
	export class Preferences {
		/**
		 * Constructor
		 */
		constructor(options?: {preferences?: object});

		/**
		 * Get preference value. Throws an error if the preference is not present and no default value is specified.
		 */
		get(preference: string, defaultValue?: any): any;

		/**
		 * Set preference value
		 */
		set(key: string, value: any): Self.Preferences;

		/**
		 * Checks for presence of the preference
		 */
		has(preference: string): boolean;

		/**
		 * Add preference bundle
		 */
		addBundle(preferences: object): Self.Preferences;

	}

	export namespace Preferences {
	}

	/**
	 * Base presenter class
	 */
	export class Presenter implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructor
		 */
		constructor(options: Self.Presenter.Options);

		/**
		 * The associated context
		 */
		context: Self.Context;

		view: Self.Component;

		/**
		 * True if the view has been created
		 */
		viewCreated: boolean;

		/**
		 * Context services
		 */
		services: Self.HierarchicalMap;

		/**
		 * Context state
		 */
		state: Self.HierarchicalMap;

		/**
		 * Route with parameters
		 */
		routeState: Self.Route.State;

		/**
		 * The translation service
		 */
		i18n: Self.I18n;

		/**
		 * True if the presenter has been initialized
		 */
		initialized: boolean;

		/**
		 * True if the presenter has been disposed
		 */
		disposed: boolean;

		/**
		 * Initializes presenter.
		 */
		initialize(): void;

		/**
		 * Creates view component.
		 */
		createView(): Self.Component;

		/**
		 * Publish event
		 */
		publish(topic: string, args?: object, options?: {mode?: Self.Context.EventMode}): void;

		/**
		 * Subscribe to event
		 */
		subscribe(topic: string, handler: (args: object) => void): {remove: () => void};

		/**
		 * Dispatch store action. When action is string or two parameters are used then action object {type: action, payload: payload} is created
		 */
		dispatchAction(action: (Self.Reducer.Action | string), payload?: any): void;

		/**
		 * Activate a new route.
		 */
		routeTo(route: Self.Route, parameters?: object, modifiers?: object): void;

		/**
		 * Disposes all presenter's resources.
		 */
		dispose(): void;

		/**
		 * Utility method that accepts either a string or a translation and returns a string.
		 */
		translate(value: (string | number | Self.Translation)): string;

		/**
		 * Creates the view if it has not been created yet
		 */
		private _createView(): Self.Component;

		/**
		 * Create a child presenter
		 */
		protected _createChild(presenterClass: any, options?: {contextName?: string; contextNameSuffix?: string; stateProvider?: Self.Context.StateProviderCallback; state?: object; eventRoot?: boolean; contextOptions?: object; presenterOptions?: object}): Self.Presenter;

		/**
		 * Registers services.
		 */
		protected _onRegisterServices(servicesContainer: Self.HierarchicalMap, rootServicesContainer: Self.HierarchicalMap): void;

		/**
		 * Registers listeners.
		 */
		protected _onRegisterListeners(): void;

		/**
		 * Method is called whenever state on the presenter's context is changed.
		 */
		protected _onStateChanged(oldState: object, currentState: object): void;

		/**
		 * Method is called whenever route on the presenter's context is changed.
		 */
		protected _onRouteChanged(oldRouteState: Self.Route.State, currentRouteState: Self.Route.State): void;

		/**
		 * Create presenter view
		 */
		protected _onCreateView(): Self.Component;

		protected _onViewCreated(): void;

		protected _onDispose(): void;

		/**
		 * Create a child presenter
		 */
		static create(presenterClass: any, options: {parentContext: Self.Context; parentPresenter?: Self.Presenter; contextName?: string; contextNameSuffix?: string; stateProvider?: Self.Context.StateProviderCallback; state?: object; eventRoot?: boolean; contextOptions?: object; presenterOptions?: object}): Self.Presenter;

		static Event: Self.Presenter.EventTypes;

	}

	export namespace Presenter {
		interface Options {
			context: Self.Context;

			parent?: Self.Presenter;

			on?: Self.EventSource.ListenerMap;

		}

		interface EventTypes {
			DISPOSE: string;

		}

	}

	/**
	 * Priority queue class
	 */
	export class PriorityQueue {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * Get the length of the queue
		 */
		length: number;

		/**
		 * True if the queue is empty
		 */
		empty: boolean;

		/**
		 * Insert item with priority
		 */
		insert(item: any, priority: number): void;

		/**
		 * Pop item with the highest priority
		 */
		pop(): any;

	}

	export namespace PriorityQueue {
	}

	/**
	 * Base interface for objects with observable properties
	 */
	export interface PropertyObservable extends Self.EventSource {
	}

	export namespace PropertyObservable {
		interface EventTypes {
			PROPERTY_CHANGED: string;

		}

		interface EventArgs {
			propertyName: string;

			oldValue: any;

			newValue: any;

		}

		const Event: Self.PropertyObservable.EventTypes;

	}

	/**
	 * Common behavior for objects with observable properties
	 */
	/**
	 * Property observable proxy
	 */
	export class PropertyObservableProxy {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * Wrap value in a PropertyObservable proxy
		 */
		static wrap(value: object): Self.PropertyObservableProxy;

	}

	export namespace PropertyObservableProxy {
	}

	/**
	 * Base class for components based on the VDom model
	 */
	export class PureComponent<Props = any, State = any> {
		/**
		 * Constructor
		 */
		constructor(props: Props, context: any);

		/**
		 * Update component state
		 */
		setState(state: Partial<State>): void;

		/**
		 * Component props
		 */
		protected props: Props;

		/**
		 * Component state
		 */
		protected state: State;

		/**
		 * Component context
		 */
		protected context: any;

		/**
		 * Component style
		 */
		protected style: any;

		/**
		 * Invoked when the component is mounted to the DOM
		 */
		protected render(): Self.VDom.Node;

		/**
		 * Alias for componentDidMount
		 * @deprecated
		 */
		protected mounted(): void;

		/**
		 * Invoked when the component is mounted to the DOM
		 */
		protected componentDidMount(): void;

		/**
		 * Alias for componentWillUnmount
		 * @deprecated
		 */
		protected willUnmount(): void;

		/**
		 * Invoked before the component is unmounted from the DOM.
		 */
		protected componentWillUnmount(): void;

		/**
		 * Alias for componentDidUpdate
		 * @deprecated
		 */
		protected updated(previousProps: Props, previousState: State, previousContext: any, snapshot: any): void;

		/**
		 * Invoked after the component is updated
		 */
		protected componentDidUpdate(previousProps: Props, previousState: State, previousContext: any, snapshot: any): void;

		/**
		 * Alias for shouldComponentUpdate
		 * @deprecated
		 */
		protected shouldUpdate(nextProps: Props, nextState: State, nextContext: any): void;

		/**
		 * Invoked when the component is mounted to DOM
		 */
		protected shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): void;

		/**
		 * Invoked when the component is mounted to DOM
		 */
		protected getSnapshotBeforeUpdate(previousProps: Props, previousState: State, previousContext: any): any;

	}

	export namespace PureComponent {
	}

	/**
	 * Rectangle
	 */
	export class Rectangle {
		/**
		 * Constructor
		 */
		constructor(rectangle: Self.Rectangle.RectangleSpec);

		right: number;

		bottom: number;

		x: number;

		y: number;

		/**
		 * Returns intersect rectangle
		 */
		intersect(rectangle: Self.Rectangle): Self.Rectangle;

		/**
		 * Check if this interset with rectangle
		 */
		intersects(rectangle: Self.Rectangle): boolean;

		/**
		 * Area of intersection
		 */
		intersectArea(rectangle: Self.Rectangle): number;

		/**
		 * Returns the smallest rectangle enclosing this rectangle and the rectangle in parameters
		 */
		union(rectangle: Self.Rectangle): Self.Rectangle;

		/**
		 * Returns true if rectangle is inside this
		 */
		contains(rectangle: Self.Rectangle): boolean;

		/**
		 * Returns true if position and size are equal
		 */
		equals(rectangle: Self.Rectangle): boolean;

		/**
		 * Adjust size of rectangle to size of argument
		 */
		clipSize(rectangle: Self.Rectangle): Self.Rectangle;

		/**
		 * Area of rectangle
		 */
		area(): number;

		/**
		 * Resize current rectangle by delta
		 */
		extend(delta: (number | Self.Rectangle)): Self.Rectangle;

		/**
		 * Move rectangle into rectangle
		 */
		moveInto(rectangle: Self.Rectangle): Self.Rectangle;

		/**
		 * Clone this rectangle
		 */
		clone(): Self.Rectangle;

		/**
		 * Round all dimensions using Math.round
		 */
		round(): Self.Rectangle;

		/**
		 * Returns smallest containig rectangle with left, top, width, height as integers
		 */
		getEnclosingIntRectangle(): Self.Rectangle;

		/**
		 * Returns rectangle with left, top, width, height are converted to integers
		 */
		getSnappedIntRectangle(): Self.Rectangle;

		/**
		 * Returns bouding rectangle of all rectangles
		 */
		static getBoundingRectangle(): Self.Rectangle;

		/**
		 * Create rectangle instance from another rectangle
		 */
		static fromBox(rectangle: Self.Rectangle): Self.Rectangle;

		/**
		 * Create rectagle instance from point
		 */
		static fromPoint(point: Self.Rectangle.Point): Self.Rectangle;

	}

	export namespace Rectangle {
		interface Point {
			x?: number;

			y?: number;

			left?: number;

			top?: number;

		}

		interface RectangleSpec {
			left: number;

			top: number;

			width: number;

			height: number;

		}

	}

	export namespace Reducer {
		/**
		 * Reducer is a function mapping a state to a new state based on a given action
		 */
		type Function = (currentState: any, action: Self.Reducer.Action) => any;

		interface Action {
			type: (string | symbol);

			payload?: any;

		}

		interface WithPath {
			reduce: Self.Reducer.Function;

			path: (string | globalThis.Array<string>);

		}

		/**
		 * Create a new reducer with a list of actions.
		 */
		function create(options: {name?: string; initialState?: object; Action?: object; before?: (Self.Reducer.Function | Self.Reducer.WithPath | globalThis.Array<(Self.Reducer.WithPath | Self.Reducer.Function)>); after?: (Self.Reducer.Function | Self.Reducer.WithPath | globalThis.Array<(Self.Reducer.WithPath | Self.Reducer.Function)>)}): any;

		/**
		 * Create a single reducer from multiple reducers. Each reducer is an object consisting of a reduce function and a path. The paths are not allowed to overlap.
		 */
		function combine(reducers: globalThis.Array<Self.Reducer.WithPath>): Self.Reducer.Function;

	}

	/**
	 * Redwood icons
	 */
	enum RedwoodIcon {
		ICO_ACCOUNTS_PAYABLE,
		ICO_ADAPTER,
		ICO_ADD_COLUMN_ALT,
		ICO_ADD_CREATE_PAGE,
		ICO_ADD_EDIT_PAGE,
		ICO_ADD_LEVEL,
		ICO_ADD_NODE,
		ICO_ADD_ROW,
		ICO_ANGLE,
		ICO_ARROW_CIRCLE_DOWN,
		ICO_ARROW_CIRCLE_UP,
		ICO_ARROW_DOWN,
		ICO_ARROW_DOWN_RIGHT,
		ICO_ARROW_LEFT,
		ICO_ARROW_RIGHT,
		ICO_ARROW_UP,
		ICO_ARROW_UP_RIGHT,
		ICO_BACK_PARENT,
		ICO_BANK,
		ICO_BAR_CHART,
		ICO_BINARY,
		ICO_BUILD,
		ICO_BUILDER,
		ICO_CALCULATOR,
		ICO_CALENDAR,
		ICO_CALENDAR_ADD,
		ICO_CALL,
		ICO_CAMERA,
		ICO_CANCEL,
		ICO_CARET_DOWN,
		ICO_CARET_UP,
		ICO_CASH_IN_TRANSIT,
		ICO_CC_CARD,
		ICO_CELL_PHONE,
		ICO_CHART_AREA,
		ICO_CHART_AREA_STACK,
		ICO_CHART_AUTO,
		ICO_CHART_AXIS_X,
		ICO_CHART_AXIS_Y,
		ICO_CHART_BAR_H,
		ICO_CHART_BAR_STACKED_100_V,
		ICO_CHART_BAR_STACKED_H,
		ICO_CHART_BAR_V,
		ICO_CHART_BUBBLE,
		ICO_CHART_GAUGE_ODOMETER,
		ICO_CHART_LINE,
		ICO_CHECK,
		ICO_CHECKBOX_CHECKED,
		ICO_CHECKBOX_PARTIAL,
		ICO_CHEVRON_DOUBLE_DOWN,
		ICO_CHEVRON_DOUBLE_LEFT,
		ICO_CHEVRON_DOUBLE_RIGHT,
		ICO_CHEVRON_DOUBLE_UP,
		ICO_CHEVRON_DOWN,
		ICO_CHEVRON_DOWN_END,
		ICO_CHEVRON_LEFT,
		ICO_CHEVRON_LEFT_END,
		ICO_CHEVRON_RIGHT,
		ICO_CHEVRON_RIGHT_END,
		ICO_CHEVRON_UP,
		ICO_CHEVRON_UP_END,
		ICO_CIRCLE,
		ICO_CIRCLE_S,
		ICO_CIRCULAR_PROGRESS,
		ICO_CLOCK,
		ICO_CLOCK_HISTORY,
		ICO_CLOSE,
		ICO_CLOSE_CIRCLE_S,
		ICO_COLLAPSE,
		ICO_COLLECTION_ALT,
		ICO_COLOR_PALETTE,
		ICO_COLUMNS,
		ICO_COMMENT_ADD,
		ICO_CONTACT_CHECK,
		ICO_CONTACT_GROUP,
		ICO_COPY,
		ICO_CURRENCY_MONEY,
		ICO_DATABASE,
		ICO_DATE,
		ICO_DATE_RANGE_INPUT,
		ICO_DIAMOND_8,
		ICO_DIVIDER_ROWS,
		ICO_DOCUMENTS,
		ICO_DOCUMENT_LINK,
		ICO_DOWNLOAD,
		ICO_DO_NOT_ENTER,
		ICO_DRAG_CORNER,
		ICO_DRAG_H,
		ICO_DRAG_HANDLE,
		ICO_DRAG_INDICATOR,
		ICO_DYNAMIC_CONFIG,
		ICO_DYNAMIC_TABLE,
		ICO_EDIT,
		ICO_EDIT_COLUMN,
		ICO_EDIT_INLINE,
		ICO_EDUCATION,
		ICO_EMAIL,
		ICO_EMOJI_MEH,
		ICO_EMOJI_SAD,
		ICO_EMOJI_SMILE,
		ICO_EMPLOYEE,
		ICO_EMPLOYEE_STATUS,
		ICO_END_NODE,
		ICO_ENTER_IDENTIFIER,
		ICO_ERROR,
		ICO_EVENT_AVAILABLE,
		ICO_EXPAND,
		ICO_EXPORT,
		ICO_EXTENDABLE_ITEM,
		ICO_FILE,
		ICO_FILE_CSV,
		ICO_FILE_EXCEL,
		ICO_FILE_PDF,
		ICO_FILTER_ALT,
		ICO_FIT_HEIGHT,
		ICO_FIT_SIZE,
		ICO_FIT_WIDTH,
		ICO_FLAGGED,
		ICO_FOLDER,
		ICO_FUNCTION,
		ICO_FUNCTION_ALT,
		ICO_FUTURE_READY,
		ICO_GRID_CONTAINER_H,
		ICO_HAPPY_FILLED,
		ICO_HASHTAG,
		ICO_HEART,
		ICO_HEART_S,
		ICO_HELP,
		ICO_HIGHLIGHT_COLOR,
		ICO_HIGHLIGHT_COLUMNS,
		ICO_HIGHLIGHT_ROWS,
		ICO_HOME,
		ICO_INFORMATION,
		ICO_INPUT_NUMBER,
		ICO_INVENTORY_COST_REVALUATION,
		ICO_ITEM_OVERVIEW,
		ICO_KEY,
		ICO_LAYOUT_1_COL_2_ROW,
		ICO_LINK,
		ICO_LOCATION_PIN,
		ICO_LOCK,
		ICO_LOG_IN,
		ICO_LOG_OUT,
		ICO_MALE,
		ICO_MEMO_PRESENT,
		ICO_MEMO_PRESENT_1,
		ICO_MEMO_PRESENT_2,
		ICO_MENU_OVERFLOW,
		ICO_MESSAGE_ALT,
		ICO_MINUS,
		ICO_MINUS_SQUARE,
		ICO_MOVE_TOGETHER,
		ICO_NETWORKING,
		ICO_NEUTRAL_FILLED,
		ICO_NOTE,
		ICO_NOTES_ADD,
		ICO_NULL_VALUE,
		ICO_OVERFLOW_H,
		ICO_OVERFLOW_VERT,
		ICO_PAGINATION,
		ICO_PARTNERS,
		ICO_PIN,
		ICO_PIN_COLUMNS,
		ICO_PIN_ROWS,
		ICO_PLAYLIST_ADD_CHECK,
		ICO_PLUS,
		ICO_PLUS_SQUARE,
		ICO_POLYMORPH,
		ICO_PRINT,
		ICO_PRODUCT_CATEGORY,
		ICO_PURCHASE_ORDER,
		ICO_PUZZLE,
		ICO_RANK_1_FILLED,
		ICO_RANK_1_OUTLINE,
		ICO_RANK_2_FILLED,
		ICO_RANK_2_OUTLINE,
		ICO_RANK_3_FILLED,
		ICO_RANK_3_OUTLINE,
		ICO_RANK_4_FILLED,
		ICO_RANK_4_OUTLINE,
		ICO_RANK_5_FILLED,
		ICO_RANK_5_OUTLINE,
		ICO_REDO,
		ICO_REFRESH,
		ICO_REMOVE_COLUMN,
		ICO_REMOVE_ROW,
		ICO_RESIZE,
		ICO_ROWS,
		ICO_SAVE,
		ICO_SAVE_AS,
		ICO_SEARCH,
		ICO_SEPARATOR,
		ICO_SET_DATA,
		ICO_SHARE,
		ICO_SHUFFLE,
		ICO_SLIDERS,
		ICO_SORT,
		ICO_SORT_RELEVANCE_HIGH,
		ICO_SORT_RELEVANCE_LOW,
		ICO_SPELL_CHECK,
		ICO_SQUARE,
		ICO_STAR,
		ICO_STAR_FULL,
		ICO_STOPWATCH,
		ICO_SUBDIRECTORY_ARROW_UP_RIGHT,
		ICO_SUBSIDIARY,
		ICO_SUCCESS,
		ICO_SWITCH_OFF,
		ICO_SYNC,
		ICO_TABLES,
		ICO_TABLES_PIVOT,
		ICO_TAG,
		ICO_TEXT,
		ICO_THEMATIC_MAP,
		ICO_THUMBS_DOWN,
		ICO_THUMBS_UP,
		ICO_TIME_OFF,
		ICO_TRANSFER_MONEY,
		ICO_TRASH,
		ICO_UNDO_ALT,
		ICO_UNGROUP,
		ICO_UNHAPPY_FILLED,
		ICO_UNLINK,
		ICO_UPLOAD,
		ICO_VERYHAPPY_FILLED,
		ICO_VERYUNHAPPY_FILLED,
		ICO_VIEW,
		ICO_VIEW_HIDE,
		ICO_VIEW_PARTIAL,
		ICO_WARNING,
		ICO_WRAP_LINE,
		ICO_WRENCH,
		ICO_ZOOM_IN,
		ICO_ZOOM_OUT,
	}

	/**
	 * Redwood icon mapping
	 */
	enum RedwoodSystemIconMapping {
	}

	/**
	 * Redwood theme
	 */
	export class RedwoodTheme extends Self.Theme {
		/**
		 * Constructs RedwoodTheme
		 */
		constructor(options?: Self.RedwoodTheme.Options);

	}

	export namespace RedwoodTheme {
		interface Options extends Self.Theme.Options {
		}

		export import Icon = Self.RedwoodIcon;

		export import SystemIconMapping = Self.RedwoodSystemIconMapping;

	}

	/**
	 * Redwood tokens
	 */
	enum RedwoodToken {
	}

	/**
	 * Class descriptor
	 */
	class ReflectionClassDescriptor {
	}

	namespace ReflectionClassDescriptor {
	}

	export enum RefreshedColorSet {
	}

	/**
	 * Refreshed icons
	 */
	enum RefreshedIcon {
		ACTUAL_SIZE,
		ADD,
		ADD_COLUMN,
		ADD_COMMENT,
		ADD_LEVEL,
		ADD_MENU,
		ADD_NODE,
		ADD_RECORD,
		ADD_ROW,
		AI_SPARKLE,
		ALERT,
		API,
		APPLICATION,
		APPOINTMENT,
		ARROW_DIAGONAL_DOWN,
		ARROW_DIAGONAL_UP,
		ARROW_DOWN,
		ARROW_LEFT,
		ARROW_PARENT,
		ARROW_RIGHT,
		ARROW_UP,
		ATTRIBUTES,
		AUTO_CALCULATE,
		AVAILABLE,
		BANK_ACCOUNT,
		BLANK,
		BLOCKED,
		BLOCKER,
		BREAK_LINK,
		BUILDER,
		CALCULATE_DURATION,
		CALENDAR,
		CALL,
		CARET_DOWN_REDWOOD,
		CASH_IN_TRANSIT,
		CHART,
		CHART_AREA,
		CHART_AREA_STACKED,
		CHART_BAR,
		CHART_BAR_STACKED,
		CHART_BUBBLE,
		CHART_COLUMN,
		CHART_COLUMN_STACKED,
		CHART_LINE,
		CHECK,
		CHECKBOX_CHECKED,
		CHECKBOX_PARTIAL,
		CHECK_SMALL,
		CHECK_SPELLING,
		CHEVRON_DOWN,
		CHEVRON_LEFT,
		CHEVRON_RIGHT,
		CHEVRON_UP,
		CLOCK,
		CLOSE,
		COLLAPSE,
		COLLECTION,
		COLOR_PALETTE,
		COMPONENTS,
		COMPRESS,
		CONDITIONAL_DATASET,
		CONDITIONAL_FORMATTING,
		CONSOLIDATE,
		CONTEXTUAL_MENU,
		COPY,
		CREDENTIALS,
		CREDIT_CARD,
		CUSTOM,
		DATASET,
		DATE,
		DELETE,
		DELTA_LOGO,
		DEPARTMENTS,
		DISMISS,
		DOCUMENTS,
		DOUBLE_CHEVRON_DOWN,
		DOUBLE_CHEVRON_LEFT,
		DOUBLE_CHEVRON_RIGHT,
		DOUBLE_CHEVRON_UP,
		DOWNLOAD_DOCUMENT,
		DRAGHANDLE,
		DRAGHANDLE_SMALL,
		DROPDOWN,
		DROPDOWN_UP,
		EDIT,
		EDIT_LOG,
		EMAIL,
		EMPLOYEE,
		EMPLOYEE_STATUS,
		END_DATE,
		END_NODE,
		ENTER_IDENTIFIER,
		ERROR,
		EXPAND,
		EXPORT,
		EXTEND_HANDLE,
		FAILED,
		FEEDBACK_NEGATIVE,
		FEEDBACK_POSITIVE,
		FILE_CSV,
		FILE_EXCEL,
		FILE_PDF,
		FILTER,
		FILTERS_LEFT,
		FILTERS_TOP,
		FLAG,
		FOLDER,
		FORMAT,
		FORMAT_NUMBER,
		FORMAT_TABLE,
		FORMAT_TEXT,
		FORMULA,
		GROUPS,
		HAMBURGER,
		HAPPY_FILLED,
		HAPPY_OUTLINE,
		HEART_FILLED,
		HEART_OUTLINE,
		HEIGHT,
		HELP,
		HIDE,
		HIDE_FILTERS,
		HIERARCHICAL,
		HIERARCHY,
		HIGHLIGHT,
		HIGHLIGHT_COLUMNS,
		HIGHLIGHT_ROWS,
		HISTORY,
		HOME,
		INDICATOR_BOTTOM,
		INDICATOR_DOWN,
		INDICATOR_UP,
		INFO,
		INSERT,
		INSIGHT,
		INVENTORY,
		JOIN_DOCUMENT,
		LINK,
		LIST,
		LOADING,
		LOCALIZE,
		LOCK,
		LOCKED_TASK,
		MANUFACTURING,
		MAP,
		MASTER_DETAIL,
		MAXIMIZE,
		MEMO_ADD,
		MEMO_HOVER,
		MEMO_PRESENT,
		MESSAGE,
		MINIMIZE,
		MINI_MAP,
		MINUS,
		MOBILE,
		MONEY,
		MOVE_BOTTOM,
		MOVE_DOWN,
		MOVE_FIRST,
		MOVE_LAST,
		MOVE_LEFT,
		MOVE_RIGHT,
		MOVE_TOGETHER,
		MOVE_TOP,
		MOVE_UP,
		NEUTRAL_FILLED,
		NEUTRAL_OUTLINE,
		NOTE,
		NULL_VALUE,
		NUMBERS,
		NUMERIC,
		OPEN_NEW,
		OVERFLOW,
		OVERVIEW,
		PAGINATION,
		PARENT_RECORD,
		PARTNERS,
		PAYABLES,
		PERFORMANCE,
		PERSON,
		PIN,
		PIN_COLUMNS,
		PIN_ROWS,
		PIVOT_TABLE,
		POLYMORPH,
		PREVIEW,
		PRINT,
		PRODUCT_CATEGORY,
		PURCHASE,
		RADIUS,
		RANKING_FILLED,
		RANKING_OUTLINE,
		RANK_1_FILLED,
		RANK_1_OUTLINE,
		RANK_2_FILLED,
		RANK_2_OUTLINE,
		RANK_3_FILLED,
		RANK_3_OUTLINE,
		RANK_4_FILLED,
		RANK_4_OUTLINE,
		RANK_5_FILLED,
		RANK_5_OUTLINE,
		RECORD,
		REDO,
		REFRESH,
		REJECTED,
		REMOVE_COLUMN,
		REMOVE_ROW,
		RESIZE,
		ROLES,
		SAVE,
		SAVE_AS,
		SCALE,
		SCHEDULE,
		SEARCH,
		SEPARATOR,
		SETTINGS,
		SHAPE_DIAMOND,
		SHARE,
		SNAPSHOT,
		SORT,
		SORT_ASCENDING,
		SORT_DESCENDING,
		SPINNER,
		START_DATE,
		STAR_FILLED,
		STAR_OUTLINE,
		STATUS_SUCCESS,
		STATUS_WARNING,
		SUBSIDIARIES,
		SUM,
		SUMMARIZE,
		SWITCH,
		TABLE_COLUMNS,
		TABLE_ROWS,
		TABLE_VALUES,
		TEXT,
		TIMER,
		TIME_OFF,
		TRANSPOSE,
		UNDO,
		UNGROUP,
		UNHAPPY_FILLED,
		UNHAPPY_OUTLINE,
		UNIVERSITY,
		UNKNOWN,
		UPLOAD_DOCUMENT,
		VERY_HAPPY_FILLED,
		VERY_HAPPY_OUTLINE,
		VERY_UNHAPPY_FILLED,
		VERY_UNHAPPY_OUTLINE,
		VIEW_BY_DATE,
		VIEW_PARENT_RECORD,
		VIEW_PARTIAL,
		VIEW_SHOW,
		WIDTH,
		WRAP_LINE,
		XAXIS,
		YAXIS,
		ZOOM_FIT,
		ZOOM_IN,
		ZOOM_OUT,
	}

	/**
	 * Refreshed theme
	 */
	export class RefreshedTheme extends Self.Theme {
		/**
		 * Constructs RefreshedTheme
		 */
		constructor(options?: Self.RefreshedTheme.Options);

		/**
		 * Gets the active color set
		 */
		colorSet: Self.RefreshedTheme.ColorSet;

		/**
		 * Get memoized RefreshedTheme instance for given color set
		 */
		static forColorSet(colorSet: Self.RefreshedTheme.ColorSet): Self.RefreshedTheme;

		/**
		 * List of available color set IDs
		 */
		static colorSets: globalThis.Array<number>;

	}

	export namespace RefreshedTheme {
		interface Options extends Self.Theme.Options {
			colorSet?: Self.RefreshedTheme.ColorSet;

		}

		interface ColorSetDefinition {
			primary: string;

			secondaryLight: string;

			secondaryDark: string;

		}

		export import Icon = Self.RefreshedIcon;

		export import ColorSet = Self.RefreshedColorSet;

	}

	/**
	 * Refreshed tokens
	 */
	enum RefreshedToken {
		colorWhite,
		colorBlack,
	}

	enum ReleaseVersion {
		R18_1,
		R18_2,
		R19_1,
		R19_2,
		R20_1,
		R20_2,
		R21_1,
		R21_2,
		R22_1,
		R22_2,
		R23_1,
		R23_2,
		R24_1,
		R24_2,
		R25_1,
		R25_2,
		current,
		incoming,
	}

	/**
	 * Require utilities
	 */
	export namespace Require {
		/**
		 * Require a module
		 */
		function module(module: string): globalThis.Promise<any>;

		/**
		 * Require multiple modules
		 */
		function modules(modules: globalThis.Array<string>): globalThis.Promise<any>;

	}

	/**
	 * Resize observer
	 */
	export class ResizeObserver {
		/**
		 * Constructor
		 */
		constructor(callback: Self.ResizeObserver.ResizeCallback, options?: {box?: Self.ResizeObserver.Box});

		/**
		 * Current target
		 */
		target: (Self.Component | Element | null);

		/**
		 * Get the last observed size
		 */
		lastObservedSize: {width: number; height: number};

		/**
		 * Start observing a target
		 */
		connect(target: (Self.Component | Element)): void;

		/**
		 * Stop observing the current target
		 */
		disconnect(): void;

		static NoSize: Self.ResizeObserver.Size;

	}

	export namespace ResizeObserver {
		interface Size {
			width: number;

			height: number;

		}

		interface ResizeArgs {
			size: Self.ResizeObserver.Size;

			previousSize: Self.ResizeObserver.Size;

		}

		type ResizeCallback = (args: Self.ResizeObserver.ResizeArgs) => void;

		enum Box {
			BORDER,
			CONTENT,
		}

	}

	/**
	 * Route is defined by URL pattern which matches one or more URLs. It can accept handler function to be called when its URL is matched.
	 * @deprecated
	 */
	export class Route {
		/**
		 * Constructs Route
		 */
		constructor(options: Self.Route.Options);

		/**
		 * Route pattern
		 */
		pattern: string;

		/**
		 * Constructs URL string based on given parameters.
		 */
		constructUrl(params?: object): string;

		/**
		 * Returns route parameters if the URL matches the route, null otherwise.
		 */
		recognizeUrl(url: string): (object | null);

		/**
		 * Calls the route handler.
		 */
		handle(args: Self.Route.HandlerArgs): void;

		/**
		 * Create a parametrized route
		 */
		withParameters(parameters: object): Self.Route.State;

		/**
		 * Creates a new Route.
		 */
		static create(url: string, handler?: Self.Route.Handler): Self.Route;

	}

	export namespace Route {
		interface Options {
			url?: string;

			handler: Self.Route.Handler;

		}

		/**
		 * Route handler is called when the route is activated
		 */
		type Handler = (args: Self.Route.HandlerArgs) => void;

		interface State {
			parameters: object;

			route: Self.Route;

		}

		interface HandlerArgs {
			context: Self.Context;

			oldParams: object;

			oldRoute: (Self.Route | null);

			params: object;

			route: Self.Route;

			router: Self.Router;

		}

	}

	/**
	 * Routed message
	 */
	export class RoutedMessage {
		/**
		 * Constructs RoutedMessage
		 */
		constructor(options: Self.RoutedMessage.Options);

		/**
		 * Unique identifier of message's type
		 */
		code: Self.MessageCode;

		/**
		 * Object that is target of this message
		 */
		recipient: (Self.Component | null);

		/**
		 * Create filter function according to supported options
		 */
		static createFilter(filter: (Record<Self.RoutedMessage.FilterCode, Self.RoutedMessage.Handler> | Self.RoutedMessage.Filter)): Self.RoutedMessage.Filter;

		/**
		 * Dispatch message along a chain of message handlers
		 */
		static dispatchChain(chain: globalThis.Array<Self.RoutedMessage.Filter>, next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace RoutedMessage {
		interface Result {
			handled: boolean;

			executeDefault: boolean;

			allowDrag: boolean;

			stopPropagation: boolean;

		}

		type Handler = (message: Self.RoutedMessage, result: Self.RoutedMessage.Result) => void;

		type Filter = (next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result) => void;

		interface Options {
			code: Self.MessageCode;

			recipient: Self.MessageHandler;

		}

		export import MessageCode = Self.MessageCode;

		export import FilterCode = Self.FilterCode;

	}

	/**
	 * Router provides URL handling in single-page applications.
	 */
	export class Router {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs Router
		 */
		constructor(options: Self.Router.Options);

		routes: globalThis.Array<Self.Route>;

		context: (Self.Context | null);

		activeRoute: (Self.Route | null);

		activeParams: object;

		activeUrl: string;

		/**
		 * Navigates to a route or URL string.
		 */
		routeTo(route?: (Self.Route | string), params?: object, args?: {replace?: boolean}): void;

		/**
		 * Redirects to a route or URL (replacing the current URL in history).
		 */
		redirectTo(route?: (Self.Route | string), params?: object): void;

		/**
		 * Registers a new route.
		 */
		addRoute(route: Self.Route): void;

		/**
		 * Unregisters route.
		 */
		removeRoute(route: Self.Route): boolean;

		/**
		 * Starts listening on URL changes.
		 */
		listen(): void;

		/**
		 * Stops listening on URL changes.
		 */
		stop(): void;

		/**
		 * Navigates back in history.
		 */
		goBack(): void;

		/**
		 * Navigates forward in history.
		 */
		goForward(): void;

		/**
		 * Creates a new Route.
		 */
		static createRoute(url: string, handler?: Self.Route.Handler): Self.Route;

		static Event: Self.Router.EventTypes;

	}

	export namespace Router {
		interface Options {
			routes: (globalThis.Array<Self.Route> | object);

			context?: Self.Context;

			on?: Self.EventSource.ListenerMap;

		}

		interface EventTypes {
			ROUTE_RECOGNIZED: string;

			ROUTE_CHANGED: string;

			ROUTE_NOT_FOUND: string;

		}

		export import Path = Self.PathRouter;

		export import Hash = Self.HashRouter;

		export import Param = Self.ParamRouter;

		export import Routes = Self.Routes;

		export import Route = Self.JsxRoute;

	}

	/**
	 * Router location
	 */
	export class RouterLocation {
		/**
		 * Constructor
		 */
		constructor(options: Self.RouterLocation.Options);

		/**
		 * Get current location
		 */
		location: string;

		/**
		 * Get the search part of the URL
		 */
		search: string;

		/**
		 * Get the hash part of the URL
		 */
		hash: string;

		/**
		 * Check if this location matches a given route
		 */
		matches(route: string, options?: {exact?: boolean}): boolean;

	}

	export namespace RouterLocation {
		interface Options {
			location: string;

			search: string;

			hash: string;

		}

	}

	/**
	 * Routes component
	 */
	export function Routes(props?: object): Self.JSX.Element;

	/**
	 * Scroll controller
	 */
	export class ScrollController implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs ScrollController
		 */
		constructor(options: {on?: Self.EventSource.ListenerMap});

		/**
		 * Gets the size of viewport
		 */
		viewportSize: Self.Scrollable.Size;

		/**
		 * Gets the size of the content inside viewport
		 */
		contentSize: Self.Scrollable.Size;

		/**
		 * Gets the scroll offset
		 */
		scrollOffset: Self.Scrollable.Offset;

		/**
		 * Scrollability
		 */
		scrollability: Self.Scrollable.Scrollability;

		/**
		 * Scrollability
		 */
		scrollabilityOffset: Self.Scrollable.Scrollability;

		/**
		 * Check if options can change current scroll offset
		 */
		canScroll(options: Self.ScrollController.ScrollOptions): boolean;

		/**
		 * Fires scroll if the offset is changed
		 */
		scroll(options: Self.ScrollController.ScrollOptions): boolean;

		/**
		 * Scroll to the top
		 */
		scrollToTop(options?: {reason?: any}): boolean;

		/**
		 * Scroll to the bottom
		 */
		scrollToBottom(options?: {reason?: any}): boolean;

		/**
		 * Resize the viewport or content
		 */
		resize(options: Self.ScrollController.ResizeOptions): boolean;

		/**
		 * Bind scrollable
		 */
		bind(scrollable: Self.Scrollable, options: object): {remove: () => void};

		/**
		 * Unbind scrollable
		 */
		unbind(scrollable: Self.Scrollable): void;

		/**
		 * Dispose the scroll controller
		 */
		dispose(): void;

		static Event: Self.ScrollController.EventTypes;

	}

	export namespace ScrollController {
		interface EventTypes {
			SCROLL: string;

			RESIZE: string;

			SCROLLABILITY_CHANGED: string;

		}

		interface ResizeOptions {
			viewportSize?: {x: (number | null); y: (number | null)};

			contentSize?: {x: (number | null); y: (number | null)};

			reason?: string;

		}

		interface ScrollOffsetChange {
			x?: number;

			y?: number;

			rx?: number;

			ry?: number;

			dx?: number;

			dy?: number;

		}

		interface ScrollOptions {
			offset: Self.ScrollController.ScrollOffsetChange;

			reason: string;

		}

		/**
		 * Scroll binding function
		 */
		enum ScrollBind {
			NoSync,
			HorizontalSync,
			VerticalSync,
		}

		/**
		 * Size binding function
		 */
		enum SizeBind {
			NoSync,
			HorizontalSync,
			VerticalSync,
		}

	}

	export class ScrollObserver implements Self.MessageHandler {
		/**
		 * Constructs ScrollObserver
		 */
		constructor();

		/**
		 * Processes message
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * Registers scroll handler on given element
		 */
		register(element: HTMLElement, handler: () => void): void;

		/**
		 * Unregisters scroll handler from given element
		 */
		unregister(element: HTMLElement): void;

	}

	export namespace ScrollObserver {
	}

	export interface Scrollable {
		/**
		 * Scroll offset
		 */
		scrollOffset: Self.Scrollable.Offset;

		/**
		 * Viewport size
		 */
		viewportSize: Self.Scrollable.Size;

		/**
		 * Content size
		 */
		contentSize: Self.Scrollable.Size;

		/**
		 * Resizes
		 */
		resize(options: object): void;

		/**
		 * Scrolls
		 */
		scroll(options: object): void;

	}

	export namespace Scrollable {
		interface EventTypes {
			RESIZE: string;

			SCROLL: string;

			SCROLLABILITY_CHANGED: string;

		}

		interface Offset {
			x: number;

			y: number;

		}

		interface Size {
			x: number;

			y: number;

		}

		interface Scrollability {
			up: boolean;

			down: boolean;

			left: boolean;

			right: boolean;

			any: boolean;

		}

		interface ScrollabilityOffset {
			up: number;

			down: number;

			left: number;

			right: number;

			any: number;

		}

		const Event: Self.Scrollable.EventTypes;

	}

	/**
	 * Set class
	 */
	export class Set {
		/**
		 * Constructor
		 */
		constructor(iterable?: Iterable<any>);

		/**
		 * Get iterator
		 */
		[Symbol.iterator](): any;

		/**
		 * Get the number of set entries
		 */
		size: number;

		/**
		 * Is the set empty
		 */
		empty: boolean;

		/**
		 * Get a list of set values in insertion order
		 */
		values: globalThis.Array<any>;

		/**
		 * Add a value to the set
		 */
		add(value: any): globalThis.Set<any>;

		/**
		 * Add all values from an array into the set
		 */
		addAll(values: globalThis.Array<any>): globalThis.Set<any>;

		/**
		 * Remove a value from the set
		 */
		delete(value: any): globalThis.Set<any>;

		/**
		 * Removes all values in the array from the set
		 */
		deleteAll(values: globalThis.Array<any>): globalThis.Set<any>;

		/**
		 * Toggle item in the set
		 */
		toggle(item: any, add?: boolean): globalThis.Set<any>;

		/**
		 * Toggle item in the set
		 */
		toggleAll(items: globalThis.Array<any>, add?: boolean): globalThis.Set<any>;

		/**
		 * Check if the set contains a particular value
		 */
		has(value: any): boolean;

		/**
		 * Check if the set contains all values in the list
		 */
		hasAll(values: globalThis.Array<any>): boolean;

		/**
		 * Check if the set contains any value in the list
		 */
		hasAny(values: globalThis.Array<any>): boolean;

		/**
		 * Clear the set
		 */
		clear(): globalThis.Set<any>;

		/**
		 * Check that this set contains all values from the argument
		 */
		contains(set: globalThis.Set<any>): boolean;

		/**
		 * Checks that two sets contain the same values
		 */
		equals(set: globalThis.Set<any>): boolean;

		/**
		 * Returns a new set containing the same values as this set
		 */
		clone(): globalThis.Set<any>;

		/**
		 * Create a new set containing all values from this set and the set in arguments
		 */
		union(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Add all values from the set into this set
		 */
		unionInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Create a new set containing all elements that are present in both sets
		 */
		intersect(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Removes all values from the set which are not contained in the argument
		 */
		intersectInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Creates a new set that contains all values that are in this set but not in the argument
		 */
		subtract(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Removes all values that are contained in the argument
		 */
		subtractInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		/**
		 * Execute callback for every value in the set
		 */
		forEach(callback: (value: any, set: globalThis.Set<any>) => void, context?: any): void;

		/**
		 * Creates a new set containing values that match the predicate
		 */
		filter(predicate: (value: any) => boolean, context?: any): globalThis.Set<any>;

		/**
		 * Removes all values that do not match the predicate
		 */
		filterInplace(predicate: (value: any) => boolean, context?: any): globalThis.Set<any>;

		/**
		 * Maps set to another set
		 */
		map(transform: (value: any) => any, context?: any): globalThis.Set<any>;

		/**
		 * Check if there is a value in the set for which the predicate holds
		 */
		some(predicate: (value: any) => boolean, context?: any): boolean;

		/**
		 * Check if a predicate holds for all values in the set
		 */
		every(predicate: (value: any) => boolean, context?: any): boolean;

		/**
		 * Create a new set from a list of values
		 */
		static fromValues(...values: globalThis.Array<any>): globalThis.Set<any>;

		/**
		 * Create a new set from an array of values
		 */
		static fromArray(array: globalThis.Array<object>): globalThis.Set<any>;

	}

	export namespace Set {
	}

	export class SimpleLogFormatter extends Self.LogFormatter {
		/**
		 * Constructs SimpleLogFormatter
		 */
		constructor();

	}

	export namespace SimpleLogFormatter {
	}

	/**
	 * Simple performance service
	 */
	export class SimplePerformance {
		/**
		 * Constructs SimplePerformance
		 */
		constructor();

		/**
		 * Performance data
		 */
		data: Self.ArrayDataSource;

		/**
		 * Adds item
		 */
		addItem(name: string, value: any): void;

		/**
		 * Begins
		 */
		begin(clazz: any, bucket: string): void;

		/**
		 * Ends
		 */
		end(clazz: any, bucket: string): void;

	}

	export namespace SimplePerformance {
		/**
		 * SimplePerformance types
		 */
		enum Type {
			BEGIN,
			END,
		}

	}

	/**
	 * Stack trace
	 */
	export namespace StackTrace {
		/**
		 * Gets current call stack and turns it to an array
		 */
		function get(): globalThis.Array<any>;

	}

	/**
	 * Precomputed size index
	 */
	class StaticSizeIndex {
	}

	namespace StaticSizeIndex {
	}

	/**
	 * Class for Storage control - LocalStorage, SessionStorage. Supports expiration while using localStorage, sessionStorage doesn't need it if LocalStorage or SessionStorage is not supported, there is a simple object fallback as pageview related storage - not handy at all, but it does not crash JS at all
	 */
	class Storage {
		/**
		 * Constructs Storage
		 */
		constructor(options?: Self.Storage.Options);

		/**
		 * select and returns requested Storage, if supported
		 */
		private _useStorage(): Self.Storage;

		/**
		 * checks sessionStorage support by browser
		 */
		private _isSessionStorageSupported(): boolean;

		/**
		 * checks localStorage support by browser
		 */
		private _isLocalStorageSupported(): boolean;

		/**
		 * helper for updating "modified" timestamp of an item, affects only Storage.js items
		 */
		private _setLastUpdate(key: string): void;

		/**
		 * gets rid of expired items, performs during Storage initialization affects only keys with prefix of current Storage instance
		 */
		private _cleanup(): void;

		/**
		 * returns final key for storage (read/write) - based on settings.encode enabled or not
		 */
		private _getFinalKey(key: string): string;

		/**
		 * extract item's expiration
		 */
		private _getItemExpiration(key: string): number;

		/**
		 * Retrieves item from used storage and returns its value with fallback to values stored as plaintext
		 */
		getItem(key: string): (string | object);

		/**
		 * Stores item to used storage with its timestamp as lastUpdate - this is used for expirationDate
		 */
		setItem(key: string, value: (string | object), expireInDays?: number): void;

		/**
		 * Manually refreshes lastUpdate of desired item/s
		 */
		touchItems(keys: (string | globalThis.Array<any>)): void;

		/**
		 * Removes item from used storage
		 */
		removeItem(key: string): void;

		/**
		 * Storage key
		 */
		static StorageSource: string;

		/**
		 * Storage key prefix
		 */
		static StorageKeyPrefix: string;

	}

	namespace Storage {
		interface Options {
			type?: Self.Storage.Type;

			keyPrefix?: string;

			encode?: boolean;

		}

		enum Type {
			SESSION,
			LOCAL,
		}

	}

	/**
	 * Fallback storage
	 */
	class StorageFallback {
		/**
		 * Constructs StorageFallback
		 */
		constructor();

		/**
		 * Stores item
		 */
		setItem(key: string, value: any): void;

		/**
		 * Gets item
		 */
		getItem(key: string): any;

		/**
		 * Removes item
		 */
		removeItem(key: string): void;

	}

	namespace StorageFallback {
	}

	/**
	 * Store
	 */
	export class Store<State = any> implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructor
		 */
		constructor(options?: Self.Store.Options);

		/**
		 * Returns true if action dispatch is asynchronous
		 */
		async: boolean;

		/**
		 * Store state
		 */
		state: State;

		/**
		 * The store reducer
		 */
		reducer: Self.Store.Reducer;

		/**
		 * Sets current state
		 */
		setState(state: State, options?: {action?: Self.Store.Action}): void;

		/**
		 * Returns state's subtree at given path if the path is provided. Otherwise, returns whole state.
		 */
		getState(path?: globalThis.Array<string>): any;

		/**
		 * Subscribe to state changes
		 */
		subscribe(callback: (state: State, sender: Self.Store) => void): () => void;

		/**
		 * Dispatches action on the current state.
		 */
		dispatch(action: (Self.Store.Action | Self.Store.ActionCreator)): globalThis.Promise<State>;

		/**
		 * Creates a store and optionally binds it to a presenter context
		 */
		static create(options: (Self.Store.CreateOptions | Self.Store.Reducer), context?: Self.Context): Self.Store;

		/**
		 * Store provider component
		 */
		static Provider(props: {store: Self.Store; children?: Self.VDom.Children}): Self.JSX.Element;

		static Event: Self.Store.EventTypes;

		/**
		 * Type of the initial action
		 */
		static INIT_ACTION_TYPE: string;

	}

	export namespace Store {
		interface Options {
			reducer?: Self.Store.Reducer;

			state?: object;

			async?: boolean;

			on?: Self.EventSource.ListenerMap;

		}

		interface Action<T = any> {
			type: (string | symbol);

			payload?: T;

		}

		type DispatchFunc = (action: (Self.Store.Action | Self.Store.ActionCreator)) => globalThis.Promise<any>;

		/**
		 * Reducer is a function mapping a state to a new state based on a given action
		 */
		type Reducer = (currentState: any, action: Self.Store.Action) => any;

		interface CreateOptions {
			reducer: Self.Store.Reducer;

			state?: object;

			onStateChanged?: (args: Self.Store.StateChangeArgs, store: Self.Store) => void;

			async?: boolean;

		}

		interface StateChangeArgs {
			oldState: any;

			currentState: any;

			action: Self.Store.Action;

		}

		type ActionCreator = (dispatch: Self.Store.DispatchFunc, getState: (path: globalThis.Array<string>) => any) => globalThis.Promise<any>;

		interface EventTypes {
			STATE_CHANGED: string;

		}

	}

	/**
	 * Utility functions for strings
	 */
	export namespace String {
		/**
		 * Check if string contains another string
		 */
		function contains(string: string, what: string, caseSensitive?: boolean): boolean;

		/**
		 * Compare strings lexicographically
		 */
		function compare(left: string, right: string, ascending?: boolean): number;

		/**
		 * Check whether string starts with a given prefix
		 */
		function startsWith(string: string, prefix: string, caseSensitive?: boolean): boolean;

		/**
		 * Check whether string ends with a given suffix
		 */
		function endsWith(string: string, suffix: string, caseSensitive?: boolean): boolean;

		/**
		 * Check whether string is an empty value
		 */
		function isEmpty(string: string): boolean;

		/**
		 * Insert a sub-string at a given position
		 */
		function insert(string: string, position: number, subString: string): void;

		/**
		 * Convert value to a string
		 */
		function of(value: any): string;

		/**
		 * Pad string from left with a given character
		 */
		function padLeft(string: string, padCharacter: string, length: number): string;

		/**
		 * Pad string from right with a given character
		 */
		function padRight(string: string, padCharacter: string, length: number): string;

		/**
		 * Repeat string multiple times
		 */
		function repeat(string: string, count: number): string;

		/**
		 * Convert the first letter of the string to upper case
		 */
		function capitalizeFirstLetter(string: string): string;

		/**
		 * Convert the first letter of the string to lower case
		 */
		function lowercaseFirstLetter(string: string): string;

		/**
		 * Convert string from camelCase to kebab-case
		 */
		function camelCaseToKebabCase(string: string, separateNumbers?: boolean): string;

		/**
		 * Converts kebab-case to camelCase
		 */
		function kebabCaseToCamelCase(string: string, capitalizeFirstLetter?: boolean): string;

		/**
		 * Converts snake_case to camelCase
		 */
		function snakeCaseToCamelCase(string: string, capitalizeFirstLetter?: boolean): string;

		/**
		 * Convert string from camelCase to snake_case
		 */
		function camelCaseToSnakeCase(string: string, separateNumbers?: boolean): string;

		/**
		 * Empty string constant
		 */
		const EMPTY: string;

	}

	/**
	 * Dynamic CSS rule
	 */
	export class Style {
		/**
		 * Constructor
		 * Do not use this constructor. Always use one of the available factory methods.
		 */
		constructor(id: string, rules: globalThis.Array<string>);

		/**
		 * Check if value is a Style
		 */
		static is(value: any): boolean;

		/**
		 * Create empty style
		 */
		static empty(): Self.Style;

		/**
		 * Css style tagged template
		 */
		static of(definition: TemplateStringsArray, ...parameters: globalThis.Array<string>): Self.Style;

		/**
		 * Css keyframes tagged template
		 */
		static keyframes(definition: TemplateStringsArray, ...parameters: globalThis.Array<string>): Self.Style;

		/**
		 * Create a new Style from a simple key-value object
		 */
		static fromObject(keyValueObject: object, keyParser?: (key: string) => string): Self.Style;

		/**
		 * Empty style
		 */
		static EMPTY: Self.Style;

	}

	export namespace Style {
	}

	/**
	 * Dynamic style manager
	 */
	class StyleManager {
	}

	namespace StyleManager {
	}

	namespace SvgLoader {
	}

	export namespace SystemIcon {
		const ACTUAL_SIZE: Self.ImageMetadata;

		const ADD: Self.ImageMetadata;

		const ADD_COLUMN: Self.ImageMetadata;

		const ADD_COMMENT: Self.ImageMetadata;

		const ADD_LEVEL: Self.ImageMetadata;

		const ADD_MENU: Self.ImageMetadata;

		const ADD_NODE: Self.ImageMetadata;

		const ADD_RECORD: Self.ImageMetadata;

		const ADD_ROW: Self.ImageMetadata;

		const AI_SPARKLE: Self.ImageMetadata;

		const ALERT: Self.ImageMetadata;

		const API: Self.ImageMetadata;

		const APPLICATION: Self.ImageMetadata;

		const APPOINTMENT: Self.ImageMetadata;

		const ARROW_DIAGONAL_DOWN: Self.ImageMetadata;

		const ARROW_DIAGONAL_UP: Self.ImageMetadata;

		const ARROW_DOWN: Self.ImageMetadata;

		const ARROW_LEFT: Self.ImageMetadata;

		const ARROW_PARENT: Self.ImageMetadata;

		const ARROW_RIGHT: Self.ImageMetadata;

		const ARROW_UP: Self.ImageMetadata;

		const ATTRIBUTES: Self.ImageMetadata;

		const AUTO_CALCULATE: Self.ImageMetadata;

		const AVAILABLE: Self.ImageMetadata;

		const BANK_ACCOUNT: Self.ImageMetadata;

		const BLANK: Self.ImageMetadata;

		const BLOCKED: Self.ImageMetadata;

		const BLOCKER: Self.ImageMetadata;

		const BREAK_LINK: Self.ImageMetadata;

		const BUILDER: Self.ImageMetadata;

		const CALCULATE_DURATION: Self.ImageMetadata;

		const CALENDAR: Self.ImageMetadata;

		const CALL: Self.ImageMetadata;

		const CASH_IN_TRANSIT: Self.ImageMetadata;

		const CARET_DOWN_REDWOOD: Self.ImageMetadata;

		const CHART: Self.ImageMetadata;

		const CHART_AREA: Self.ImageMetadata;

		const CHART_AREA_STACKED: Self.ImageMetadata;

		const CHART_BAR: Self.ImageMetadata;

		const CHART_BAR_STACKED: Self.ImageMetadata;

		const CHART_BUBBLE: Self.ImageMetadata;

		const CHART_COLUMN: Self.ImageMetadata;

		const CHART_COLUMN_STACKED: Self.ImageMetadata;

		const CHART_LINE: Self.ImageMetadata;

		const CHECK: Self.ImageMetadata;

		const CHECKBOX_CHECKED: Self.ImageMetadata;

		const CHECKBOX_PARTIAL: Self.ImageMetadata;

		const CHECK_SMALL: Self.ImageMetadata;

		const CHECK_SPELLING: Self.ImageMetadata;

		const CHEVRON_DOWN: Self.ImageMetadata;

		const CHEVRON_LEFT: Self.ImageMetadata;

		const CHEVRON_RIGHT: Self.ImageMetadata;

		const CHEVRON_UP: Self.ImageMetadata;

		const CLOCK: Self.ImageMetadata;

		const CLOSE: Self.ImageMetadata;

		const COLLAPSE: Self.ImageMetadata;

		const COLLECTION: Self.ImageMetadata;

		const COLOR_PALETTE: Self.ImageMetadata;

		const COMPONENTS: Self.ImageMetadata;

		const COMPRESS: Self.ImageMetadata;

		const CONDITIONAL_DATASET: Self.ImageMetadata;

		const CONDITIONAL_FORMATTING: Self.ImageMetadata;

		const CONSOLIDATE: Self.ImageMetadata;

		const CONTEXTUAL_MENU: Self.ImageMetadata;

		const COPY: Self.ImageMetadata;

		const CREDENTIALS: Self.ImageMetadata;

		const CREDIT_CARD: Self.ImageMetadata;

		const CUSTOM: Self.ImageMetadata;

		const DATASET: Self.ImageMetadata;

		const DATE: Self.ImageMetadata;

		const DELETE: Self.ImageMetadata;

		const DELTA_LOGO: Self.ImageMetadata;

		const DEPARTMENTS: Self.ImageMetadata;

		const DISMISS: Self.ImageMetadata;

		const DOCUMENTS: Self.ImageMetadata;

		const DOUBLE_CHEVRON_DOWN: Self.ImageMetadata;

		const DOUBLE_CHEVRON_LEFT: Self.ImageMetadata;

		const DOUBLE_CHEVRON_RIGHT: Self.ImageMetadata;

		const DOUBLE_CHEVRON_UP: Self.ImageMetadata;

		const DOWNLOAD_DOCUMENT: Self.ImageMetadata;

		const DRAGHANDLE: Self.ImageMetadata;

		const DRAGHANDLE_SMALL: Self.ImageMetadata;

		const DROPDOWN: Self.ImageMetadata;

		const DROPDOWN_UP: Self.ImageMetadata;

		const EDIT: Self.ImageMetadata;

		const EDIT_LOG: Self.ImageMetadata;

		const EMAIL: Self.ImageMetadata;

		const EMPLOYEE: Self.ImageMetadata;

		const EMPLOYEE_STATUS: Self.ImageMetadata;

		const END_DATE: Self.ImageMetadata;

		const END_NODE: Self.ImageMetadata;

		const ENTER_IDENTIFIER: Self.ImageMetadata;

		const ERROR: Self.ImageMetadata;

		const EXPAND: Self.ImageMetadata;

		const EXPORT: Self.ImageMetadata;

		const EXTEND_HANDLE: Self.ImageMetadata;

		const FAILED: Self.ImageMetadata;

		const FEEDBACK_NEGATIVE: Self.ImageMetadata;

		const FEEDBACK_POSITIVE: Self.ImageMetadata;

		const FILE_CSV: Self.ImageMetadata;

		const FILE_EXCEL: Self.ImageMetadata;

		const FILE_PDF: Self.ImageMetadata;

		const FILTER: Self.ImageMetadata;

		const FILTERS_LEFT: Self.ImageMetadata;

		const FILTERS_TOP: Self.ImageMetadata;

		const FLAG: Self.ImageMetadata;

		const FOLDER: Self.ImageMetadata;

		const FORMAT: Self.ImageMetadata;

		const FORMAT_NUMBER: Self.ImageMetadata;

		const FORMAT_TABLE: Self.ImageMetadata;

		const FORMAT_TEXT: Self.ImageMetadata;

		const FORMULA: Self.ImageMetadata;

		const GROUPS: Self.ImageMetadata;

		const HAMBURGER: Self.ImageMetadata;

		const HAPPY_FILLED: Self.ImageMetadata;

		const HAPPY_OUTLINE: Self.ImageMetadata;

		const HEART_FILLED: Self.ImageMetadata;

		const HEART_OUTLINE: Self.ImageMetadata;

		const HEIGHT: Self.ImageMetadata;

		const HELP: Self.ImageMetadata;

		const HIDE: Self.ImageMetadata;

		const HIDE_FILTERS: Self.ImageMetadata;

		const HIERARCHICAL: Self.ImageMetadata;

		const HIERARCHY: Self.ImageMetadata;

		const HIGHLIGHT: Self.ImageMetadata;

		const HIGHLIGHT_COLUMNS: Self.ImageMetadata;

		const HIGHLIGHT_ROWS: Self.ImageMetadata;

		const HISTORY: Self.ImageMetadata;

		const HOME: Self.ImageMetadata;

		const INDICATOR_BOTTOM: Self.ImageMetadata;

		const INDICATOR_DOWN: Self.ImageMetadata;

		const INDICATOR_UP: Self.ImageMetadata;

		const INFO: Self.ImageMetadata;

		const INSERT: Self.ImageMetadata;

		const INSIGHT: Self.ImageMetadata;

		const INVENTORY: Self.ImageMetadata;

		const JOIN_DOCUMENT: Self.ImageMetadata;

		const LINK: Self.ImageMetadata;

		const LIST: Self.ImageMetadata;

		const LOADING: Self.ImageMetadata;

		const LOCALIZE: Self.ImageMetadata;

		const LOCK: Self.ImageMetadata;

		const LOCKED_TASK: Self.ImageMetadata;

		const MANUFACTURING: Self.ImageMetadata;

		const MAP: Self.ImageMetadata;

		const MASTER_DETAIL: Self.ImageMetadata;

		const MAXIMIZE: Self.ImageMetadata;

		const MEMO_ADD: Self.ImageMetadata;

		const MEMO_HOVER: Self.ImageMetadata;

		const MEMO_PRESENT: Self.ImageMetadata;

		const MESSAGE: Self.ImageMetadata;

		const MINIMIZE: Self.ImageMetadata;

		const MINI_MAP: Self.ImageMetadata;

		const MINUS: Self.ImageMetadata;

		const MOBILE: Self.ImageMetadata;

		const MONEY: Self.ImageMetadata;

		const MOVE_BOTTOM: Self.ImageMetadata;

		const MOVE_DOWN: Self.ImageMetadata;

		const MOVE_FIRST: Self.ImageMetadata;

		const MOVE_LAST: Self.ImageMetadata;

		const MOVE_LEFT: Self.ImageMetadata;

		const MOVE_RIGHT: Self.ImageMetadata;

		const MOVE_TOGETHER: Self.ImageMetadata;

		const MOVE_TOP: Self.ImageMetadata;

		const MOVE_UP: Self.ImageMetadata;

		const NEUTRAL_FILLED: Self.ImageMetadata;

		const NEUTRAL_OUTLINE: Self.ImageMetadata;

		const NOTE: Self.ImageMetadata;

		const NULL_VALUE: Self.ImageMetadata;

		const NUMBERS: Self.ImageMetadata;

		const NUMERIC: Self.ImageMetadata;

		const OPEN_NEW: Self.ImageMetadata;

		const OVERFLOW: Self.ImageMetadata;

		const OVERVIEW: Self.ImageMetadata;

		const PAGINATION: Self.ImageMetadata;

		const PARENT_RECORD: Self.ImageMetadata;

		const PARTNERS: Self.ImageMetadata;

		const PAYABLES: Self.ImageMetadata;

		const PERFORMANCE: Self.ImageMetadata;

		const PERSON: Self.ImageMetadata;

		const PIN: Self.ImageMetadata;

		const PIN_COLUMNS: Self.ImageMetadata;

		const PIN_ROWS: Self.ImageMetadata;

		const PIVOT_TABLE: Self.ImageMetadata;

		const POLYMORPH: Self.ImageMetadata;

		const PREVIEW: Self.ImageMetadata;

		const PRINT: Self.ImageMetadata;

		const PRODUCT_CATEGORY: Self.ImageMetadata;

		const PURCHASE: Self.ImageMetadata;

		const RADIUS: Self.ImageMetadata;

		const RANKING_FILLED: Self.ImageMetadata;

		const RANKING_OUTLINE: Self.ImageMetadata;

		const RANK_1_FILLED: Self.ImageMetadata;

		const RANK_1_OUTLINE: Self.ImageMetadata;

		const RANK_2_FILLED: Self.ImageMetadata;

		const RANK_2_OUTLINE: Self.ImageMetadata;

		const RANK_3_FILLED: Self.ImageMetadata;

		const RANK_3_OUTLINE: Self.ImageMetadata;

		const RANK_4_FILLED: Self.ImageMetadata;

		const RANK_4_OUTLINE: Self.ImageMetadata;

		const RANK_5_FILLED: Self.ImageMetadata;

		const RANK_5_OUTLINE: Self.ImageMetadata;

		const RECORD: Self.ImageMetadata;

		const REDO: Self.ImageMetadata;

		const REFRESH: Self.ImageMetadata;

		const REJECTED: Self.ImageMetadata;

		const REMOVE_COLUMN: Self.ImageMetadata;

		const REMOVE_ROW: Self.ImageMetadata;

		const RESIZE: Self.ImageMetadata;

		const ROLES: Self.ImageMetadata;

		const SAVE: Self.ImageMetadata;

		const SAVE_AS: Self.ImageMetadata;

		const SCALE: Self.ImageMetadata;

		const SCHEDULE: Self.ImageMetadata;

		const SEARCH: Self.ImageMetadata;

		const SEPARATOR: Self.ImageMetadata;

		const SETTINGS: Self.ImageMetadata;

		const SHAPE_DIAMOND: Self.ImageMetadata;

		const SHARE: Self.ImageMetadata;

		const SNAPSHOT: Self.ImageMetadata;

		const SORT: Self.ImageMetadata;

		const SORT_ASCENDING: Self.ImageMetadata;

		const SORT_DESCENDING: Self.ImageMetadata;

		const SPINNER: Self.ImageMetadata;

		const START_DATE: Self.ImageMetadata;

		const STAR_FILLED: Self.ImageMetadata;

		const STAR_OUTLINE: Self.ImageMetadata;

		const STATUS_SUCCESS: Self.ImageMetadata;

		const STATUS_WARNING: Self.ImageMetadata;

		const SUBSIDIARIES: Self.ImageMetadata;

		const SUM: Self.ImageMetadata;

		const SUMMARIZE: Self.ImageMetadata;

		const SWITCH: Self.ImageMetadata;

		const TABLE_COLUMNS: Self.ImageMetadata;

		const TABLE_ROWS: Self.ImageMetadata;

		const TABLE_VALUES: Self.ImageMetadata;

		const TEXT: Self.ImageMetadata;

		const TIMER: Self.ImageMetadata;

		const TIME_OFF: Self.ImageMetadata;

		const TRANSPOSE: Self.ImageMetadata;

		const UNDO: Self.ImageMetadata;

		const UNGROUP: Self.ImageMetadata;

		const UNHAPPY_FILLED: Self.ImageMetadata;

		const UNHAPPY_OUTLINE: Self.ImageMetadata;

		const UNIVERSITY: Self.ImageMetadata;

		const UNKNOWN: Self.ImageMetadata;

		const UPLOAD_DOCUMENT: Self.ImageMetadata;

		const VERY_HAPPY_FILLED: Self.ImageMetadata;

		const VERY_HAPPY_OUTLINE: Self.ImageMetadata;

		const VERY_UNHAPPY_FILLED: Self.ImageMetadata;

		const VERY_UNHAPPY_OUTLINE: Self.ImageMetadata;

		const VIEW_BY_DATE: Self.ImageMetadata;

		const VIEW_PARENT_RECORD: Self.ImageMetadata;

		const VIEW_PARTIAL: Self.ImageMetadata;

		const VIEW_SHOW: Self.ImageMetadata;

		const WIDTH: Self.ImageMetadata;

		const WRAP_LINE: Self.ImageMetadata;

		const XAXIS: Self.ImageMetadata;

		const YAXIS: Self.ImageMetadata;

		const ZOOM_FIT: Self.ImageMetadata;

		const ZOOM_IN: Self.ImageMetadata;

		const ZOOM_OUT: Self.ImageMetadata;

	}

	/**
	 * Theme base class
	 */
	export class Theme {
		/**
		 * Constructs Theme
		 */
		constructor(options: Self.Theme.Options);

		/**
		 * Gets theme name
		 */
		name: Self.Theme.Name;

		/**
		 * Gets theme tokens as an JS Object
		 */
		tokens: Record<string, any>;

		/**
		 * Gets theme mixins as an JS Object
		 */
		mixins: Record<string, Function>;

		/**
		 * Get theme root style
		 */
		rootStyle: Self.Style;

		/**
		 * Get theme drag and drop style
		 */
		dragAndDropStyle: Self.Style;

		/**
		 * Gets theme tokens as a CSS rule
		 */
		cssVariablesStyle: Self.Style;

		/**
		 * Gets styles for a component class
		 */
		getComponentStyles(Component: (((...args: globalThis.Array<any>) => any) | object), provider?: (theme: Self.Theme) => object): object;

		/**
		 * Gets theme specific icon per provided ID
		 */
		getIcon(id: string): (Self.ImageMetadata | null);

		/**
		 * Creates style with theme CSS variables
		 */
		private generateCssVariablesStyle(): Self.Style;

	}

	export namespace Theme {
		interface Options {
			name: Self.Theme.Name;

			rootStyle: Self.Style;

			tokens?: object;

			icons?: object;

			systemIconsMapping?: object;

		}

		export import Name = Self.ThemeName;

		/**
		 * Theme background
		 */
		enum Background {
			LIGHT,
			DARK,
		}

	}

	/**
	 * Theme background context provider
	 */
	export function ThemeBackground(props: {value: Self.Theme.Background; children?: Self.VDom.Children}): Self.JSX.Element;

	/**
	 * Theme icons
	 */
	enum ThemeIcon {
		ACTUAL_SIZE,
		ADD,
		ADD_COLUMN,
		ADD_COMMENT,
		ADD_LEVEL,
		ADD_MENU,
		ADD_NODE,
		ADD_RECORD,
		ADD_ROW,
		AI_SPARKLE,
		ALERT,
		API,
		APPLICATION,
		APPOINTMENT,
		ARROW_DIAGONAL_DOWN,
		ARROW_DIAGONAL_UP,
		ARROW_DOWN,
		ARROW_LEFT,
		ARROW_PARENT,
		ARROW_RIGHT,
		ARROW_UP,
		ATTRIBUTES,
		AUTO_CALCULATE,
		AVAILABLE,
		BANK_ACCOUNT,
		BLANK,
		BLOCKED,
		BLOCKER,
		BREAK_LINK,
		BUILDER,
		CALCULATE_DURATION,
		CALENDAR,
		CALL,
		CASH_IN_TRANSIT,
		CARET_DOWN_REDWOOD,
		CHART,
		CHART_AREA,
		CHART_AREA_STACKED,
		CHART_BAR,
		CHART_BAR_STACKED,
		CHART_BUBBLE,
		CHART_COLUMN,
		CHART_COLUMN_STACKED,
		CHART_LINE,
		CHECK,
		CHECKBOX_CHECKED,
		CHECKBOX_PARTIAL,
		CHECK_SMALL,
		CHECK_SPELLING,
		CHEVRON_DOWN,
		CHEVRON_LEFT,
		CHEVRON_RIGHT,
		CHEVRON_UP,
		CLOCK,
		CLOSE,
		COLLAPSE,
		COLLECTION,
		COLOR_PALETTE,
		COMPONENTS,
		COMPRESS,
		CONDITIONAL_DATASET,
		CONDITIONAL_FORMATTING,
		CONSOLIDATE,
		CONTEXTUAL_MENU,
		COPY,
		CREDENTIALS,
		CREDIT_CARD,
		CUSTOM,
		DATASET,
		DATE,
		DELETE,
		DELTA_LOGO,
		DEPARTMENTS,
		DISMISS,
		DOCUMENTS,
		DOUBLE_CHEVRON_DOWN,
		DOUBLE_CHEVRON_LEFT,
		DOUBLE_CHEVRON_RIGHT,
		DOUBLE_CHEVRON_UP,
		DOWNLOAD_DOCUMENT,
		DRAGHANDLE,
		DRAGHANDLE_SMALL,
		DROPDOWN,
		DROPDOWN_UP,
		EDIT,
		EDIT_LOG,
		EMAIL,
		EMPLOYEE,
		EMPLOYEE_STATUS,
		END_DATE,
		END_NODE,
		ENTER_IDENTIFIER,
		ERROR,
		EXPAND,
		EXPORT,
		EXTEND_HANDLE,
		FAILED,
		FEEDBACK_NEGATIVE,
		FEEDBACK_POSITIVE,
		FILE_CSV,
		FILE_EXCEL,
		FILE_PDF,
		FILTER,
		FILTERS_LEFT,
		FILTERS_TOP,
		FLAG,
		FOLDER,
		FORMAT,
		FORMAT_NUMBER,
		FORMAT_TABLE,
		FORMAT_TEXT,
		FORMULA,
		GROUPS,
		HAMBURGER,
		HAPPY_FILLED,
		HAPPY_OUTLINE,
		HEART_FILLED,
		HEART_OUTLINE,
		HEIGHT,
		HELP,
		HIDE,
		HIDE_FILTERS,
		HIERARCHICAL,
		HIERARCHY,
		HIGHLIGHT,
		HIGHLIGHT_COLUMNS,
		HIGHLIGHT_ROWS,
		HISTORY,
		HOME,
		INDICATOR_BOTTOM,
		INDICATOR_DOWN,
		INDICATOR_UP,
		INFO,
		INSERT,
		INSIGHT,
		INVENTORY,
		JOIN_DOCUMENT,
		LINK,
		LIST,
		LOADING,
		LOCALIZE,
		LOCK,
		LOCKED_TASK,
		MANUFACTURING,
		MAP,
		MASTER_DETAIL,
		MAXIMIZE,
		MEMO_ADD,
		MEMO_HOVER,
		MEMO_PRESENT,
		MESSAGE,
		MINIMIZE,
		MINI_MAP,
		MINUS,
		MOBILE,
		MONEY,
		MOVE_BOTTOM,
		MOVE_DOWN,
		MOVE_FIRST,
		MOVE_LAST,
		MOVE_LEFT,
		MOVE_RIGHT,
		MOVE_TOGETHER,
		MOVE_TOP,
		MOVE_UP,
		NEUTRAL_FILLED,
		NEUTRAL_OUTLINE,
		NOTE,
		NULL_VALUE,
		NUMBERS,
		NUMERIC,
		OPEN_NEW,
		OVERFLOW,
		OVERVIEW,
		PAGINATION,
		PARENT_RECORD,
		PARTNERS,
		PAYABLES,
		PERFORMANCE,
		PERSON,
		PIN,
		PIN_COLUMNS,
		PIN_ROWS,
		PIVOT_TABLE,
		POLYMORPH,
		PREVIEW,
		PRINT,
		PRODUCT_CATEGORY,
		PURCHASE,
		RADIUS,
		RANKING_FILLED,
		RANKING_OUTLINE,
		RANK_1_FILLED,
		RANK_1_OUTLINE,
		RANK_2_FILLED,
		RANK_2_OUTLINE,
		RANK_3_FILLED,
		RANK_3_OUTLINE,
		RANK_4_FILLED,
		RANK_4_OUTLINE,
		RANK_5_FILLED,
		RANK_5_OUTLINE,
		RECORD,
		REDO,
		REFRESH,
		REJECTED,
		REMOVE_COLUMN,
		REMOVE_ROW,
		RESIZE,
		ROLES,
		SAVE,
		SAVE_AS,
		SCALE,
		SCHEDULE,
		SEARCH,
		SEPARATOR,
		SETTINGS,
		SHAPE_DIAMOND,
		SHARE,
		SNAPSHOT,
		SORT,
		SORT_ASCENDING,
		SORT_DESCENDING,
		SPINNER,
		START_DATE,
		STAR_FILLED,
		STAR_OUTLINE,
		STATUS_SUCCESS,
		STATUS_WARNING,
		SUBSIDIARIES,
		SUM,
		SUMMARIZE,
		SWITCH,
		TABLE_COLUMNS,
		TABLE_ROWS,
		TABLE_VALUES,
		TEXT,
		TIMER,
		TIME_OFF,
		TRANSPOSE,
		UNDO,
		UNGROUP,
		UNHAPPY_FILLED,
		UNHAPPY_OUTLINE,
		UNIVERSITY,
		UNKNOWN,
		UPLOAD_DOCUMENT,
		VERY_HAPPY_FILLED,
		VERY_HAPPY_OUTLINE,
		VERY_UNHAPPY_FILLED,
		VERY_UNHAPPY_OUTLINE,
		VIEW_BY_DATE,
		VIEW_PARENT_RECORD,
		VIEW_PARTIAL,
		VIEW_SHOW,
		WIDTH,
		WRAP_LINE,
		XAXIS,
		YAXIS,
		ZOOM_FIT,
		ZOOM_IN,
		ZOOM_OUT,
	}

	/**
	 * Theme names
	 */
	enum ThemeName {
		REFRESHED,
		REDWOOD,
	}

	export namespace Thenable {
		/**
		 * Convert a value to 'thenable'. Promises are returned unchanged and static values are converted to a promise.
		 */
		function when(value?: any): globalThis.Promise<any>;

	}

	/**
	 * Immutable time class
	 */
	export class Time {
		/**
		 * Constructor
		 */
		constructor(options?: Self.Time.Options);

		/**
		 * Get the number of hours
		 */
		hours: number;

		/**
		 * Returns a modified copy of the time instance
		 */
		setHours(newValue: number): Self.Time;

		/**
		 * Get the number of minutes
		 */
		minutes: number;

		/**
		 * Returns modified copy of the time instance
		 */
		setMinutes(newValue: number): Self.Time;

		/**
		 * Get the number of seconds
		 */
		seconds: number;

		/**
		 * Returns modified copy of the time instance
		 */
		setSeconds(newValue: number): Self.Time;

		/**
		 * Get the number of milliseconds
		 */
		milliseconds: number;

		/**
		 * Returns modified copy of the time instance
		 */
		setMilliseconds(newValue: number): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		set(args: Self.Time.Options): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		addHours(hours: number): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		addMinutes(minutes: number): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		addSeconds(seconds: number): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		addMilliseconds(milliseconds: number): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		add(timeDiff: Self.Time.AddType): Self.Time;

		/**
		 * Returns modified copy of the time instance
		 */
		subtract(args: Self.Time.AddType): Self.Time;

		/**
		 * Returns 1 if this time is after given time Returns 0 if both times are equal Returns -1 if this time is before given time
		 */
		compareTo(time: Self.Time): number;

		/**
		 * Check time for equality
		 */
		equals(time: Self.Time): boolean;

		/**
		 * Returns true if this time is before the time in the argument
		 */
		before(time: Self.Time): boolean;

		/**
		 * Returns true if this time is after the time in the argument
		 */
		after(time: Self.Time): boolean;

		between(rangeStart: Self.Time, rangeEnd: Self.Time): boolean;

		/**
		 * Modify the time component of a given date
		 */
		toDate(date: Self.Date): Self.Date;

		/**
		 * Returns the current time
		 */
		static now(): Self.Time;

		/**
		 * Returns the time part of a date
		 */
		static fromDate(date: Self.Date): Self.Time;

		/**
		 * Compare two time values
		 */
		static compare(left: Self.Time, right: Self.Time): number;

		/**
		 * Compare two nullable time values for equality
		 */
		static equals(left: (Self.Time | null), right: (Self.Time | null)): boolean;

		/**
		 * Earliest possible time value
		 */
		static startOfDay: Self.Time;

		/**
		 * Lat3est possible time value
		 */
		static endOfDay: Self.Time;

	}

	export namespace Time {
		interface Options {
			hours?: number;

			minutes?: number;

			seconds?: number;

			milliseconds?: number;

		}

		/**
		 * Standard time formats
		 */
		enum Format {
			isoTime,
			plain12h,
			plain24h,
		}

		interface AddType {
			hours?: number;

			minutes?: number;

			seconds?: number;

			milliseconds?: number;

		}

	}

	class TimeFormat {
	}

	namespace TimeFormat {
	}

	/**
	 * Convenient setTimeout and requestAnimationFrame wrapper
	 */
	export class Timer {
		/**
		 * Constructor
		 */
		constructor();

		/**
		 * True if timer has been scheduled
		 */
		scheduled: boolean;

		/**
		 * Schedule a callback and possibly cancel the previous one
		 */
		reschedule(callback: () => void, timeout?: number): void;

		/**
		 * Schedule a callback if one is not already scheduled
		 */
		schedule(callback: () => void, timeout?: number): void;

		/**
		 * Request an animation frame
		 */
		scheduleAnimation(callback: () => void, timeout?: number): void;

		/**
		 * Cancel the currently scheduled callback
		 */
		cancel(): void;

		/**
		 * Start counter
		 */
		startCounter(): void;

		/**
		 * Get elapsed time from start
		 */
		getCounterElapsedTime(): (number | null);

		/**
		 * Null the counter
		 */
		nullCounter(): void;

	}

	export namespace Timer {
	}

	/**
	 * Transformed translation
	 */
	class TransformedTranslation extends Self.Translation {
		/**
		 * Constructor
		 */
		constructor(original: Self.Translation, transform: (text: string, i18n: Self.I18n) => string);

	}

	namespace TransformedTranslation {
	}

	/**
	 * Translation string
	 */
	export class Translation {
		/**
		 * Constructor
		 */
		constructor(args: (string | Self.I18n.GetParam));

		/**
		 * Translate the string using a translation context
		 */
		translate(i18n: Self.I18n): string;

		/**
		 * Returns a new translation that will use the original Translation and transform its output using the transform function.
		 */
		transform(transform: (text: string, i18n: Self.I18n) => string): Self.TransformedTranslation;

		/**
		 * Create a translation object
		 */
		static of(args: (string | Self.I18n.GetParam)): Self.Translation;

		/**
		 * Create a computed translation
		 */
		static computed(callback: (i18n: Self.I18n) => string): Self.Translation;

		/**
		 * Check if value is a translation instance
		 */
		static is(value: any): boolean;

	}

	export namespace Translation {
	}

	/**
	 * Hierarchical data source
	 */
	export class TreeDataSource implements Self.MutableDataSource, Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructor
		 */
		constructor(options: {data: globalThis.Array<any>; childAccessor?: (string | Self.TreeDataSource.ChildAccessorCallback)});

		/**
		 * The data object
		 */
		data: globalThis.Array<any>;

		/**
		 * Query data source items
		 */
		query(args: Self.DataSource.QueryArguments, resolve: (args: {items: globalThis.Array<any>}) => void, reject?: (error: any) => void): void;

		/**
		 * Replace the whole tree with a new data
		 */
		setData(data: globalThis.Array<any>): void;

		/**
		 * Return item at index path
		 */
		itemAtIndexPath(indexPath: globalThis.Array<number>): any;

		/**
		 * Adds items to the collection
		 */
		add(args: {parent?: any; item?: any; items?: globalThis.Array<any>; index?: number; reason?: string}): object;

		/**
		 * Remove items from the collection
		 */
		remove(args: {parent?: any; item?: any; items?: globalThis.Array<any>; index?: number; count?: number; reason?: string}): object;

		/**
		 * Remove all items from the data source
		 */
		clear(args?: {parent?: any}): void;

		/**
		 * Change order of elements in the collection. Moves a chunk of items from one position to another.
		 */
		move(args: {sourceParent?: number; sourceIndex: number; targetParent?: number; targetIndex: number; count?: number; reason?: string}): object;

		/**
		 * Returns a new filtered data source
		 */
		filter(filter: (item: any) => boolean): Self.GenericDataSource;

	}

	export namespace TreeDataSource {
		type ChildAccessorCallback = (args: {dataItem: any}, resolve: (items: globalThis.Array<any>) => void, reject: (error: any) => void) => void;

	}

	/**
	 * Type checking utilities
	 */
	export namespace Type {
		interface Matcher {
			is: (value: any) => boolean;

			name: (options: object) => string;

		}

		/**
		 * Array type checker. Matches any (possibly heterogeneous) array.
		 */
		const Array: Self.Type.Matcher;

		/**
		 * Array that is empty
		 */
		const EmptyArray: Self.Type.Matcher;

		/**
		 * Array that is not empty
		 */
		const NonEmptyArray: Self.Type.Matcher;

		/**
		 * Function type checker.
		 */
		const Function: Self.Type.Matcher;

		/**
		 * String type checker. Warning: Does not match instances of the String wrapper class.
		 */
		const String: Self.Type.Matcher;

		/**
		 * Empty string
		 */
		const EmptyString: Self.Type.Matcher;

		/**
		 * Non-empty string
		 */
		const NonEmptyString: Self.Type.Matcher;

		/**
		 * Date checker
		 */
		const Date: Self.Type.Matcher;

		/**
		 * Native date checker
		 */
		const NativeDate: Self.Type.Matcher;

		/**
		 * Matches both UIF Date and native Date
		 */
		const AnyDate: Self.Type.Matcher;

		/**
		 * HTMLElement checker
		 */
		const HTMLElement: Self.Type.Matcher;

		/**
		 * Element checker
		 */
		const Element: Self.Type.Matcher;

		/**
		 * Error checker
		 */
		const Error: Self.Type.Matcher;

		/**
		 * String pattern checker.
		 */
		function StringPattern(regex: RegExp): Self.Type.Matcher;

		/**
		 * String has email format
		 */
		const Email: Self.Type.Matcher;

		/**
		 * Number type checker. Matches any finite number, i.e., does not match infinity or NaN.
		 */
		const Number: Self.Type.Matcher;

		/**
		 * Negative number checker. Matches any finite negative number.
		 */
		const NegativeNumber: Self.Type.Matcher;

		/**
		 * Non-negative number checker. Matches any finite and non-negative number.
		 */
		const NonNegativeNumber: Self.Type.Matcher;

		/**
		 * Positive number checker. Matches any finite number greater than 0.
		 */
		const PositiveNumber: Self.Type.Matcher;

		/**
		 * Checks if a given number belongs to a given closed range
		 */
		function BoundedNumber(min: number, max: number): Self.Type.Matcher;

		/**
		 * Integer checker. Matches any finite number that does not have a fractional part.
		 */
		const Integer: Self.Type.Matcher;

		/**
		 * Negative integer checker. Matches any finite negative integer.
		 */
		const NegativeInteger: Self.Type.Matcher;

		/**
		 * Non-negative integer checker. Matches any finite and non-negative integer number.
		 */
		const NonNegativeInteger: Self.Type.Matcher;

		/**
		 * Positive integer checker. Matches any finite integer number greater than 0.
		 */
		const PositiveInteger: Self.Type.Matcher;

		/**
		 * Checks if given Integer belongs to a given closed range
		 */
		function BoundedInteger(min: number, max: number): Self.Type.Matcher;

		/**
		 * Boolean type checker Warning: Does not match instances of the Boolean wrapper class.
		 */
		const Boolean: Self.Type.Matcher;

		/**
		 * Object type checker. Matches all "pure" objects, does not match functions and arrays.
		 */
		const Object: Self.Type.Matcher;

		/**
		 * Instance checker
		 */
		function InstanceOf(klass: Function): Self.Type.Matcher;

		/**
		 * Type checker that matches classes implementing all listed interfaces
		 */
		function Implements(...interfaces: globalThis.Array<Self.Interface>): Self.Type.Matcher;

		/**
		 * Checker for primitive types. Matches all values except objects, functions and arrays.
		 */
		const Primitive: Self.Type.Matcher;

		/**
		 * Plain object checker. Matches objects created using the '{}' syntax, i.e., objects that don't have a complex prototype chain.
		 */
		const PlainObject: Self.Type.Matcher;

		/**
		 * Null type checker.
		 */
		const Null: Self.Type.Matcher;

		/**
		 * Undefined type checker.
		 */
		const Undefined: Self.Type.Matcher;

		/**
		 * Checker that matches anything except null and undefined.
		 */
		const Value: Self.Type.Matcher;

		/**
		 * Checker that matches null and undefined.
		 */
		const NoValue: Self.Type.Matcher;

		/**
		 * Checker that matches a type or a no value
		 */
		function Optional(): Self.Type.Matcher;

		/**
		 * Checker that takes a list of types and matches any of them
		 */
		function AnyOf(...types: globalThis.Array<any>): Self.Type.Matcher;

		/**
		 * Checker that takes a list of types and matches any value that does not have any of the supplied types
		 */
		function NoneOf(...types: globalThis.Array<any>): Self.Type.Matcher;

		/**
		 * Enum type checker. Takes an enum and returns a checker that matches the enum values.
		 */
		function Enum(enumObject: object, enumName?: string): Self.Type.Matcher;

		/**
		 * Homogeneous array checker. Takes a type and returns a checker that matches any array whose all element have the supplied type.
		 */
		function ArrayOf(type: Self.Type.Matcher): Self.Type.Matcher;

		/**
		 * Non-empty homogeneous array
		 */
		function NonEmptyArrayOf(type: Self.Type.Matcher): Self.Type.Matcher;

		/**
		 * Object checker that matches plain objects that have specific properties of a specific type
		 */
		function PlainObjectOf(properties: object): Self.Type.Matcher;

		/**
		 * Object checker that matches objects that have specific properties of a specific type
		 */
		function ObjectOf(properties: object): Self.Type.Matcher;

		/**
		 * Object that has a 'then' method
		 */
		const Thenable: Self.Type.Matcher;

		/**
		 * Object is iterable
		 */
		const Iterable: Self.Type.Matcher;

		/**
		 * Object is an interface
		 */
		const Interface: Self.Type.Matcher;

		/**
		 * Object is a mixin
		 */
		const Mixin: Self.Type.Matcher;

		/**
		 * Symbol type checker
		 */
		const Symbol: Self.Type.Matcher;

	}

	/**
	 * Url
	 */
	export class Url {
		/**
		 * Constructor
		 */
		constructor(url: (null | string | Self.Url | Self.Url.Definition));

		/**
		 * Url without query and hash parts
		 */
		base: string;

		/**
		 * Key value object of params
		 */
		params: globalThis.Map<any, any>;

		/**
		 * Hash part of url
		 */
		fragment: string;

		/**
		 * Convert url to a string
		 */
		toString(): string;

		/**
		 * Get parameter value
		 */
		getParameter(name: string): (string | globalThis.Array<string>);

		/**
		 * Add paramter to the url
		 */
		addParameter(name: string, value: (string | globalThis.Array<string>)): Self.Url;

		/**
		 * Remove parameters
		 */
		removeParameter(name: string): Self.Url;

		/**
		 * Get url parameters
		 */
		getParameters(): globalThis.Map<any, any>;

		/**
		 * Add multiple parameters
		 */
		addParameters(parameters: (object | globalThis.Map<any, any>)): Self.Url;

		/**
		 * Remove multiple parameters
		 */
		removeParameters(parameters: globalThis.Array<string>): Self.Url;

		/**
		 * Get url fragment
		 */
		getFragment(): string;

		/**
		 * Set fragment
		 */
		setFragment(fragment: string): Self.Url;

		/**
		 * Remove fragment
		 */
		removeFragment(): Self.Url;

		/**
		 * Get base url
		 */
		getBase(): string;

		/**
		 * Add parameter to the url string
		 */
		static addParameter(url: (null | string | Self.Url | Self.Url.Definition), parameter: string, value: string): string;

		/**
		 * Add more parameters to the url string
		 */
		static addParameters(url: (null | string | Self.Url | Self.Url.Definition), parameters: object): string;

		/**
		 * Remove parameter from url string
		 */
		static removeParameter(url: (null | string | Self.Url | Self.Url.Definition), parameter: string): string;

		/**
		 * Remove parameters from url string
		 */
		static removeParameters(url: (string | Self.Url), ...parameters: globalThis.Array<any>): string;

		/**
		 * Get parameters from url
		 */
		static getParameters(url: string): globalThis.Map<any, any>;

		/**
		 * Get base part from url
		 */
		static getBase(url: string): string;

		/**
		 * Get fragment part from url
		 */
		static getFragment(url: string): string;

		/**
		 * Create email link
		 */
		static createEmailLink(email: (string | Self.Url.EmailDefinition)): Self.Url;

	}

	export namespace Url {
		interface Definition {
			base?: string;

			params?: object;

			fragment?: string;

		}

		interface EmailDefinition {
			email?: string;

			cc?: string;

			bcc?: string;

			subject?: string;

			body?: string;

		}

	}

	/**
	 * User message handle
	 */
	export class UserMessageHandle implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructor
		 */
		constructor(message: Self.UserMessageService.MessageOptions);

		/**
		 * The user message
		 */
		message: Self.UserMessageService.MessageOptions;

		/**
		 * True if the message is visible
		 */
		shown: boolean;

		/**
		 * Show the message
		 */
		show(): void;

		/**
		 * Hide the message
		 */
		hide(): void;

		/**
		 * Toggle the message
		 */
		toggle(show: boolean): void;

		static Event: Self.UserMessageHandle.EventTypes;

	}

	export namespace UserMessageHandle {
		interface EventTypes {
			SHOW: symbol;

			HIDE: symbol;

		}

	}

	/**
	 * Service for displaying messages on page
	 */
	export class UserMessageService implements Self.EventSource {
		/**
		 * Register event listener. The function can be used with either an eventName and a listener or using just a single object argument where keys are event names and values are listeners to attach to them.
		 */
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Remove listener from a particular event. You can also remove listeners from multiple events by using a single object argument where keys are event names and values listeners to remove.
		 */
		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		/**
		 * Fire an event
		 */
		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		/**
		 * Dispose all event listeners
		 */
		protected _disposeEvents(): void;

		/**
		 * Register event listener
		 */
		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		/**
		 * Check if event is deprecated
		 */
		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		/**
		 * Constructs UserMessageService
		 */
		constructor(options: Self.UserMessageService.Options);

		/**
		 * Get message handles
		 */
		handles: globalThis.Array<Self.UserMessageHandle>;

		/**
		 * Shows a message
		 */
		show(message: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		/**
		 * Clear all messages of given display type
		 */
		clear(displayType: Self.UserMessageService.DisplayType): void;

		/**
		 * Shows error message
		 */
		error(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		/**
		 * Shows warning message
		 */
		warning(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		/**
		 * Shows info message
		 */
		info(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		/**
		 * Shows success message
		 */
		success(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		/**
		 * Creates a child user message service. You can either specify a specific banner and growl panel to be used by this service or preferably use the displayTypes option to specify which messages should be captured by this service and which should bubble up to the parent service. The messages from the service will be automatically displayed by any BannerPanel of GrowlPanel contained in the corresponding component subtree. Calling clear on the child service will clear only messages shown through the child service even if they are displayed in the same panel as messages from the parent service.
		 */
		createChild(args: {displayTypes?: globalThis.Array<Self.UserMessageService.DisplayType>; bannerPanel?: PackageComponent.BannerPanel; growlPanel?: PackageComponent.GrowlPanel}): void;

		static Event: Self.UserMessageService.EventTypes;

	}

	export namespace UserMessageService {
		interface MessageOptions {
			title?: (string | Self.Translation);

			content?: (string | Self.Translation | Self.Component);

			icon?: PackageComponent.Image.Source;

			displayType?: Self.UserMessageService.DisplayType;

			showCloseButton?: boolean;

			closeOnClick?: boolean;

			duration?: number;

			type?: Self.UserMessageService.MessageType;

			on?: Self.EventSource.ListenerMap;

		}

		interface EventTypes {
			SHOW_MESSAGE: string;

			HIDE_MESSAGE: string;

		}

		interface Options {
			parent?: Self.UserMessageService;

			displayTypes?: globalThis.Array<Self.UserMessageService.DisplayType>;

			bannerPanel?: PackageComponent.BannerPanel;

			growlPanel?: PackageComponent.GrowlPanel;

		}

		enum MessageType {
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

		enum DisplayType {
			BANNER,
			GROWL,
		}

	}

	/**
	 * Create a new virtual element node
	 */
	export function VDom(type: (string | ((props?: object) => Self.VDomElement)), config?: object, children?: Self.VDom.Children): Self.VDomElement;

	export namespace VDom {
		type Node = (string | number | Self.VDomElement | null);

		type Children = (Self.VDom.Node | globalThis.Array<Self.VDom.Node>);

		/**
		 * Jsx factory
		 */
		function jsx(type: (string | ((props?: object) => Self.VDomElement)), config?: object, key?: string): Self.VDomElement;

		/**
		 * Render virtual DOM to an element
		 */
		function render(element: Self.VDom.Node, container: Element): Self.VDomRoot;

		/**
		 * Flush all virtual DOM updates
		 */
		function flushUpdates(): void;

		/**
		 * Modify host component element by adding new props
		 */
		function cloneHostComponent(element: Self.VDomElement, config: object): Self.VDomElement;

		type ClassList = (string | Self.Style | globalThis.Array<(string | Self.Style)> | Record<string, (string | Self.Style)>);

		/**
		 * Create a class attribute by combining multiple class sets
		 */
		function classNames(...values: globalThis.Array<Self.VDom.ClassList>): globalThis.Array<string>;

		/**
		 * Get element props (attributes) from a DOM element
		 */
		function domElementProps(element: HTMLElement, options: {withIds?: boolean}): object;

		/**
		 * Convert native Dom to VDom
		 */
		function fromDom(element: Element, options: {withIds?: boolean}): Self.VDomElement;

		/**
		 * Convert a HTML string to VDom
		 */
		function fromString(string: string): Self.VDomElement;

		/**
		 * Create an array out of the VDom children structure
		 */
		function children(children: Self.VDom.Children, omitEmpty?: boolean): globalThis.Array<Self.VDom.Node>;

		/**
		 * Fragment component
		 */
		function Fragment(props: {children?: Self.VDom.Children}): Self.VDomElement;

		/**
		 * Portal component
		 */
		function Portal(props: {container: HTMLElement; children?: Self.VDom.Children}): Self.VDomElement;

		interface SingleContextProps {
			type: (string | symbol);

			value: any;

			children?: Self.VDom.Children;

		}

		interface MultipleContextProps {
			value: object;

			children?: Self.VDom.Children;

		}

		/**
		 * Context provider component
		 */
		function Context(props: (Self.VDom.SingleContextProps | Self.VDom.MultipleContextProps)): Self.VDomElement;

		/**
		 * Element decorator
		 */
		function ElementDecorator(props: object): Self.VDomElement;

		/**
		 * Message filter
		 */
		function MessageFilter(props: object): Self.VDomElement;

		/**
		 * Context portal
		 */
		function ContextPortal(props: object): Self.VDomElement;

		/**
		 * Create element reference
		 */
		function ref<T = any>(): Self.VDomRef<T>;

		export import Element = Self.VDomElement;

		export import Ref = Self.VDomRef;

	}

	/**
	 * Virtual DOM element
	 */
	export class VDomElement {
		/**
		 * VDomElement tag
		 */
		tag: Self.VDomFiberTag;

		/**
		 * VDomElement type
		 */
		type: (string | symbol | ((props: any) => Self.VDomElement));

		/**
		 * VDomElement props
		 */
		props: any;

		/**
		 * VDomElement key
		 */
		key: any;

		/**
		 * VDomElement ref
		 */
		ref: (Self.VDomRef | null);

		/**
		 * Constructor
		 */
		constructor(tag: Self.VDomFiberTag, type: (string | symbol | ((props: any) => Self.VDomElement)), key: any, ref: (Self.VDomRef | null), props: any, flags: number);

		/**
		 * Create a clone with given props
		 */
		cloneWithProps(props: object): Self.VDomElement;

		/**
		 * Create a clone with a different type
		 */
		cloneWithType(type: any): Self.VDomElement;

		/**
		 * Create a clone with a different ref
		 */
		cloneWithRef(ref: Self.VDomRef): Self.VDomElement;

		/**
		 * Create a clone with different children
		 */
		cloneWithChildren(children: Self.VDom.Children): Self.VDomElement;

		/**
		 * Returns true if this is a host component
		 */
		isHostComponent(): boolean;

		/**
		 * Create a virtual text node
		 */
		static text(text: string): Self.VDomElement;

		/**
		 * Create a virtual fragment node
		 */
		static fragment(children: Self.VDom.Children): Self.VDomElement;

		/**
		 * Create host component instance virtual node
		 */
		static hostComponentInstance(node: Element): Self.VDomElement;

		/**
		 * Create legacy component instance virtual node
		 */
		static legacyComponentInstance(instance: Self.Component): Self.VDomElement;

		/**
		 * Create an error node
		 */
		static errorNode(error?: Error): Self.VDomElement;

	}

	export namespace VDomElement {
	}

	/**
	 * Virtual DOM fiber
	 */
	class VDomFiber {
	}

	namespace VDomFiber {
	}

	/**
	 * Fiber flags
	 */
	enum VDomFiberFlag {
		NO_FLAG,
		WITH_MOUNTED,
		WITH_WILL_UNMOUNT,
		WITH_SHOULD_UPDATE,
		WITH_UPDATED,
		WITH_SNAPSHOT,
		WITH_GET_DERIVED_STATE,
		WITH_STYLE,
		INSTANCE,
	}

	/**
	 * Fiber tag
	 */
	enum VDomFiberTag {
		HOST_ROOT,
		HOST_COMPONENT,
		HOST_TEXT,
		HOST_PORTAL,
		CLASS_COMPONENT,
		FUNCTION_COMPONENT,
		LEGACY_COMPONENT,
		ELEMENT_COMPONENT,
		FRAGMENT,
		CONTEXT_PROVIDER,
		ELEMENT_DECORATOR,
		MESSAGE_FILTER,
		CONTEXT_PORTAL,
		TRANSLATION,
	}

	/**
	 * Virtual dom hook
	 */
	class VDomHook {
		/**
		 * Constructor
		 */
		constructor(tag: Self.VDomHookTag);

	}

	namespace VDomHook {
	}

	/**
	 * Hook tag
	 */
	enum VDomHookTag {
		EFFECT,
		CONTEXT,
		STYLE,
		REDUCER,
		REF,
		CALLBACK,
		MEMO,
		SYNC_EXTERNAL_STORE,
	}

	/**
	 * Virtual DOM element reference
	 */
	export class VDomRef<T = any> {
		/**
		 * Constructor
		 */
		constructor(initial?: T);

		/**
		 * Current reference
		 */
		current: T;

	}

	export namespace VDomRef {
	}

	/**
	 * Fiber root
	 */
	class VDomRoot {
		/**
		 * Constructor
		 */
		constructor(container: Element, host?: PackageComponent.Host);

	}

	namespace VDomRoot {
	}

	export class ValueChangeMessage extends Self.RoutedMessage {
		/**
		 * Constructs ValueChangeMessage
		 */
		constructor(options: Self.ValueChangeMessage.Options);

		/**
		 * Target element of event
		 */
		element: Element;

		static fromEvent(event: InputEvent): Self.ValueChangeMessage;

	}

	export namespace ValueChangeMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

		}

	}

	/**
	 * Immutable vector class
	 */
	export class Vector {
		/**
		 * Constructor
		 */
		constructor(x: number, y: number);

		/**
		 * Add another vector
		 */
		add(right: Self.Vector): Self.Vector;

		/**
		 * Add scalar value
		 */
		addScalar(value: number): Self.Vector;

		/**
		 * Subtract a vector
		 */
		subtract(right: Self.Vector): Self.Vector;

		/**
		 * Subtract scalar value
		 */
		subtractScalar(value: number): Self.Vector;

		/**
		 * Pointwise mutliply by another vector
		 */
		multiply(right: Self.Vector): Self.Vector;

		/**
		 * Multiply by scalar
		 */
		multiplyByScalar(value: number): Self.Vector;

		/**
		 * Pointwise divide by another vector
		 */
		divide(right: Self.Vector): Self.Vector;

		/**
		 * Divide by scalar
		 */
		divideByScalar(value: number): Self.Vector;

		/**
		 * Pointwise maximum of 2 vectors
		 */
		max(right: Self.Vector): Self.Vector;

		/**
		 * Pointwise minimum of 2 vectors
		 */
		min(right: Self.Vector): Self.Vector;

		/**
		 * Get the length of the vector
		 */
		length(): number;

		/**
		 * Add two vectors
		 */
		static add(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Add scalar to vector
		 */
		static addScalar(vector: Self.Vector, value: number): Self.Vector;

		/**
		 * Subtract two vectors
		 */
		static subtract(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Subtract scalar from vector
		 */
		static subtractScalar(vector: Self.Vector, value: Self.Vector): Self.Vector;

		/**
		 * Pointwise multiply two vectors
		 */
		static multiply(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Multiply vector by scalar
		 */
		static multiplyByScalar(vector: Self.Vector, value: number): Self.Vector;

		/**
		 * Pointwise divide two vectors
		 */
		static divide(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Divide vector by scalar
		 */
		static divideByScalar(vector: Self.Vector, value: number): Self.Vector;

		/**
		 * Pointwise maximum of 2 vectors
		 */
		static max(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Pointwise minimum of 2 vectors
		 */
		static min(left: Self.Vector, right: Self.Vector): Self.Vector;

		/**
		 * Calculate length of a vector
		 */
		static calculateLength(vector: Self.Vector): number;

	}

	export namespace Vector {
	}

	export class ViewMessage extends Self.RoutedMessage {
		/**
		 * Constructs ViewMessage
		 */
		constructor(options: Self.ViewMessage.Options);

		/**
		 * Target element of event
		 */
		element: Element;

		static fromEvent(event: Event): Self.ViewMessage;

	}

	export namespace ViewMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

		}

	}

	/**
	 * Window manager
	 */
	export class WindowManager {
		/**
		 * Constructs WindowManager
		 */
		constructor();

		/**
		 * Get the list of opened windows
		 */
		windows: globalThis.Array<PackageComponent.Window>;

		/**
		 * Get top most modal
		 */
		topMostModal: PackageComponent.Window;

		/**
		 * Opens window
		 */
		open(window: PackageComponent.Window, filter: Self.RoutedMessage.Filter): void;

		/**
		 * Closes window
		 */
		close(window: PackageComponent.Window): void;

		/**
		 * Activates window
		 */
		activate(window: PackageComponent.Window): void;

		/**
		 * Processes message
		 */
		processMessage(next: Self.RoutedMessage.Handler, message: object, result: object): void;

	}

	export namespace WindowManager {
	}

	/**
	 * Parse date/time string
	 */
	function dateParser(tokenList: RegExp, string: string, format: string, options?: object): object;

	/**
	 * Reconstructs child fibers after a legacy component has been attached or detached
	 */
	function reconstructFiberChildren(fiber: Self.VDomFiber): void;

	/**
	 * Reconstruct fibers from given node to the closest node managed by the virtual DOM
	 */
	function reconstructFiberPath(node: Node): Self.VDomFiber;

	/**
	 * Callback hook
	 */
	export function useCallback<T extends Function>(callback: T, dependencies?: globalThis.Array<any>): T;

	/**
	 * Context hook
	 */
	export function useContext<T = any>(type: string): T;

	/**
	 * Dispatch hook
	 */
	export function useDispatch(): Self.Store.DispatchFunc;

	/**
	 * Layout effect hook
	 */
	export function useEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

	/**
	 * Generate a unique ID that is stable across re-renders
	 */
	export function useId(): string;

	/**
	 * Layout effect hook
	 */
	export function useLayoutEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

	/**
	 * Memo hook
	 */
	export function useMemo<T>(create: () => T, dependencies?: globalThis.Array<any>): T;

	/**
	 * Reducer hook
	 */
	export function useReducer(reducer: (state: any, action: object) => any, initialState: any): [any, (action: object) => any];

	/**
	 * Ref hook
	 */
	export function useRef<T = any>(initialValue?: T): Self.VDomRef<T>;

	/**
	 * Select value from the Store
	 */
	export function useSelector<State, Selected>(selector: (state: State) => Selected, equalityFn?: (left: Selected, right: Selected) => boolean): Selected;

	/**
	 * State hook
	 */
	export function useState<T = any>(initialState: T): [T, (state: T) => void];

	/**
	 * Style hook
	 */
	export function useStyles(provider: (theme: Self.Theme) => object): any;

}
