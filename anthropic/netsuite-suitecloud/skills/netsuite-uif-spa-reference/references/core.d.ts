declare module '@uif-js/core/jsx-runtime' {}

declare module '@uif-js/core' {
	import * as Self from '@uif-js/core'
	import * as PackageComponent from '@uif-js/component'

	export class Accelerator {
		constructor(options: object);

		registerShortcut(keyStroke: globalThis.Array<Self.KeyStroke.Source>, handler: Self.KeyShortcut.ActionCallback): {unregister: () => void};

		add(shortcut: Self.KeyShortcut): {remove: () => void};

		remove(shortcut: Self.KeyShortcut): void;

		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace Accelerator {
	}

	export class Ajax {
		static get(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

		static post(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

		static put(url: string, data?: (object | ArrayBuffer | Blob | FormData | Document | XMLDocument), options?: Self.Ajax.Options): globalThis.Promise<any>;

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

		enum DataType {
			POST,
			ARRAYBUFFER,
			BLOB,
			DOCUMENT,
			FORMDATA,
			JSON,
			XML,
		}

		enum ResponseType {
			AUTO,
			XML,
			TEXT,
			DOCUMENT,
			JSON,
		}

	}

	export class AjaxReporter extends Self.LogReporter {
		constructor();

		url: string;

		defaultNotificationUrl: string;

	}

	export namespace AjaxReporter {
	}

	export class AppContext {
		constructor();

		title: string;

		favicon: (string | null);

		setFavicon(url: string, options?: object, type?: Self.AppContext.FaviconType): void;

		private setFaviconProperties(favicon: HTMLElement, url: string, type: Self.AppContext.FaviconType): void;

		registerBeforeEnd(handler: () => boolean): {remove: () => void};

	}

	export namespace AppContext {
		enum FaviconType {
			ICO,
			PNG,
			GIF,
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

	export namespace Array {
		function generate(size: number, initializer: (index: number) => any): globalThis.Array<any>;

		function generateMatrix(width: number, height: number, initializer: (row: number, column: number) => any): globalThis.Array<globalThis.Array<any>>;

		function isEmpty(array: globalThis.Array<any>): boolean;

		function equals(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): boolean;

		function from(arrayLike: any): globalThis.Array<any>;

		function fromValue(value: any): globalThis.Array<any>;

		function fromValues(...list: globalThis.Array<any>): globalThis.Array<any>;

		function fromArrayLike(arg: object): globalThis.Array<any>;

		function fromIterator(arg: any): globalThis.Array<any>;

		interface FindResult {
			found: boolean;

			item?: any;

			index?: number;

		}

		function findFirst(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): Self.Array.FindResult;

		function findLast(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): Self.Array.FindResult;

		function contains(array: globalThis.Array<any>, value: any): boolean;

		function containsAll(array1: globalThis.Array<any>, array2: globalThis.Array<any>): boolean;

		function containsMatching(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): boolean;

		function copy(array: globalThis.Array<any>): globalThis.Array<any>;

		function deepCopy(array: globalThis.Array<any>): globalThis.Array<any>;

		function reverse(array: globalThis.Array<any>): globalThis.Array<any>;

		function insert(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		function insertAll(array: globalThis.Array<any>, index: number, items: globalThis.Array<any>): globalThis.Array<any>;

		function reorder(array: globalThis.Array<any>, sourceIndex: number, targetIndex: number, count?: number): globalThis.Array<any>;

		function intersect(left: globalThis.Array<any>, right: globalThis.Array<any>): globalThis.Array<any>;

		function remove(array: globalThis.Array<any>, item: any): boolean;

		function removeAt(array: globalThis.Array<any>, index: number, count?: number): globalThis.Array<any>;

		function removeAll(array: globalThis.Array<any>, items: globalThis.Array<any>): number;

		function filter(array: globalThis.Array<any>, predicate: (item: any, index: number) => boolean): globalThis.Array<{index: number; item: any}>;

		function map(array: globalThis.Array<any>, transform: (item: any, index: number) => any): void;

		function concat(left: globalThis.Array<any>, right: globalThis.Array<any>): void;

		function concatReversed(left: globalThis.Array<any>, right: globalThis.Array<any>): void;

		function toObject(array: globalThis.Array<any>, mapper?: (item: any, index: number) => ({key: string; value: any} | null)): object;

		function range(from: number, count: number, step?: number): globalThis.Array<any>;

		function repeat(value: any, count: number): globalThis.Array<any>;

		function firstItem(array: globalThis.Array<any>): (any | null);

		function firstItemOrDefault(array: globalThis.Array<any>, defaultValue: any): any;

		function lastItem(array: globalThis.Array<any>): (any | null);

		function lastItemOrDefault(array: globalThis.Array<any>, defaultValue: any): any;

		function randomItem(array: globalThis.Array<any>): (null | any);

		function binarySearch(array: globalThis.Array<any>, comparator: (left: any, right: any) => number): {found: boolean; index: number};

		function diff(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		function diffSorted(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		function diffByKey(left: globalThis.Array<any>, right: globalThis.Array<any>, keyExtractor?: (item: any) => any): globalThis.Array<any>;

		function deduplicate(array: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		function deduplicateSorted(array: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): globalThis.Array<any>;

		function deduplicateByKey(array: globalThis.Array<any>, keyExtractor?: (item: any) => any): globalThis.Array<any>;

		function shuffle(array: globalThis.Array<any>): void;

		function commonPrefixLength(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): void;

		function commonSuffixLength(left: globalThis.Array<any>, right: globalThis.Array<any>, comparator?: (left: any, right: any) => boolean): void;

		function somePair<T>(array: globalThis.Array<T>, predicate: (left: T, right: T) => boolean): void;

		const EMPTY: globalThis.Array<any>;

	}

	export class ArrayDataSource<T = any> implements Self.MutableDataSource<T>, Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(array?: globalThis.Array<T>);

		length: number;

		empty: boolean;

		[Symbol.iterator](): Iterator<T>;

		firstItem: (T | null);

		lastItem: (T | null);

		query(args: Self.DataSource.QueryArguments, onResult: (args: {items: globalThis.Array<T>}) => void, onError?: (error: any) => void): void;

		add(args: {item?: T; items?: globalThis.Array<T>; index?: number; reason?: string}): Self.MutableDataSource.AddResult<T>;

		remove(args: {item?: T; items?: globalThis.Array<T>; index?: number; count?: number; reason?: string}): Self.MutableDataSource.RemoveResult<T>;

		clear(): void;

		move(args: {sourceIndex: number; targetIndex: number; count?: number; reason?: string}): Self.MutableDataSource.MoveResult<T>;

		forEach(callback: (item: T, index: number) => void): void;

		filter(filter: (item: T, index: number) => boolean): Self.ArrayDataSource;

		map<O>(transform: (item: T, index: number) => O): Self.ArrayDataSource<O>;

		sort(comparator: (left: T, right: T) => number): Self.ArrayDataSource<T>;

		itemAtIndex(index: number): T;

		toArray(): globalThis.Array<T>;

		indexOf(item: T): (number | null);

		contains(item: T): boolean;

		containsMatching(predicate: (item: T) => boolean): boolean;

		find(predicate: (item: T, index: number) => boolean): (T | null);

		findFirst(predicate: (item: T) => boolean): {found: boolean; item: (T | null); index: (number | null)};

		findLast(predicate: (item: T) => boolean): {found: boolean; item: (T | null); index: (number | null)};

		slice(startIndex: number, endIndex?: number): Self.ArrayDataSource;

	}

	export namespace ArrayDataSource {
	}

	export namespace Assert {
		function checkNotNull(value: any, message?: string): void;

		function checkArgument(condition: boolean, message?: string): void;

		function checkState(condition: boolean, message?: string): void;

		function checkIndex(index: number, size: number, message?: string): void;

		function checkRange(value: number, start: number, end: number, message?: string): void;

		function checkType(value: any, type: Self.Type.Matcher, message?: (string | (() => string))): void;

		function fail(message?: string): void;

		function checkProperty(value: any, type: Self.Type.Matcher, name: string): void;

		function checkProperties(properties: object, types: Record<string, Self.Type.Matcher>): void;

	}

	export namespace Async {
		function delay(timeout: number): globalThis.Promise<any>;

	}

	export interface BloomComponent {
		bloom: boolean;

	}

	export namespace BloomComponent {
	}

	export class BrowserConsoleReporter extends Self.LogReporter {
		constructor();

		useTraceForAll: boolean;

	}

	export namespace BrowserConsoleReporter {
	}

	class BundleManager {
	}

	namespace BundleManager {
	}

	export class CancellationToken {
		constructor();

		cancelled: boolean;

		onCancel(callback: (args: object) => void): void;

		private _cancel(args: object): void;

	}

	export namespace CancellationToken {
	}

	export class CancellationTokenSource {
		constructor();

		cancelled: boolean;

		token: Self.CancellationToken;

		cancel(args: object): void;

	}

	export namespace CancellationTokenSource {
	}

	export namespace Class {
		function create(definition: {initialize?: (...args: globalThis.Array<any>) => any; methods?: object; overrides?: object; properties?: object; events?: boolean; automationId?: string; mixin?: (Self.Mixin | globalThis.Array<Self.Mixin>); static?: object; extend?: object; implement?: (Self.Interface | globalThis.Array<Self.Interface>)}): (...args: globalThis.Array<any>) => any;

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

	class ClassDescriptor {
	}

	namespace ClassDescriptor {
	}

	export class ClipboardMessage extends Self.RoutedMessage {
		constructor(options: Self.ClipboardMessage.Options);

		element: EventTarget;

		clipboardData: DataTransfer;

		getData(mimeType?: string): string;

		static fromEvent(event: ClipboardEvent): Self.ClipboardMessage;

	}

	export namespace ClipboardMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

			clipboardData: DataTransfer;

		}

	}

	export class Color {
		constructor(color: Self.Color.Definition, type?: Self.Color.Model, options?: {assert?: boolean});

		hex: Self.Color.HEXObject;

		rgb: Self.Color.RGBObject;

		cmyk: Self.Color.CMYKObject;

		hsl: object;

		hsv: Self.Color.HSVObject;

		hwb: Self.Color.HWBObject;

		lab: Self.Color.LABObject;

		grayscale: Self.Color.GrayscaleObject;

		alpha: object;

		complement: Self.Color;

		luminosity: number;

		isDark: boolean;

		isLight: boolean;

		setColor(color: Self.Color.Definition, type?: Self.Color.Model): Self.Color;

		setRed(red: number): Self.Color;

		setGreen(green: number): Self.Color;

		setBlue(blue: number): Self.Color;

		setCyan(cyan: number): Self.Color;

		setMagenta(magenta: number): Self.Color;

		setYellow(yellow: number): Self.Color;

		setBlack(black: number): Self.Color;

		adjustHue(degrees: number): Self.Color;

		desaturate(ratio: number): Self.Color;

		desaturateByAmount(amount: number): Self.Color;

		saturate(ratio: number): Self.Color;

		saturateByAmount(amount: number): Self.Color;

		darken(ratio: number): Self.Color;

		darkenByAmount(amount: number): Self.Color;

		lighten(ratio: number): Self.Color;

		lightenByAmount(amount: number): Self.Color;

		blacken(ratio: number): Self.Color;

		blackenByAmount(amount: number): Self.Color;

		whiten(ratio: number): Self.Color;

		whitenByAmount(amount: number): Self.Color;

		fade(ratio: number): Self.Color;

		fadeByAmount(amount: number): Self.Color;

		opaquer(ratio: number): Self.Color;

		opaquerByAmount(amount: number): Self.Color;

		setHue(hue: number): Self.Color;

		setSaturationHsl(saturation: number): Self.Color;

		setLightness(lightness: number): Self.Color;

		setSaturationHsv(saturation: number): Self.Color;

		setValue(value: number): Self.Color;

		setWhiteness(whiteness: number): Self.Color;

		setBlackness(blackness: number): Self.Color;

		setAlpha(alpha: number): Self.Color;

		negate(): void;

		isEqual(color: Self.Color): boolean;

		mix(color: Self.Color, weight?: number): void;

		copy(): Self.Color;

		toString(): string;

		private _eightBitChannelToPercent(channel: number): number;

		private _zeroToOneChannelToPercent(channel: number): number;

		static rgbToHex(rgb: Self.Color.RGB, withAlpha?: boolean, options?: {assert?: boolean}): Self.Color.HEX;

		static rgbToCmyk(rgb: Self.Color.RGB, options?: {assert?: boolean}): Self.Color.CMYK;

		static rgbToHsl(rgb: Self.Color.RGB, options?: {assert?: boolean}): Self.Color.HSL;

		static rgbToHsv(rgb: Self.Color.RGB, options?: {assert?: boolean}): Self.Color.HSV;

		static rgbToGrayscaleLuminosity(rgb: Self.Color.RGB, options?: {assert?: boolean}): number;

		static rgbToGrayscaleLightness(rgb: Self.Color.RGB, options?: {assert?: boolean}): number;

		static rgbToGrayscaleAverage(rgb: Self.Color.RGB, options?: {assert?: boolean}): number;

		static rgbToLab(rgb: Self.Color.RGB, options?: {assert?: boolean}): Self.Color.LAB;

		static hexToRgb(hex: Self.Color.HEX, options?: {assert?: boolean}): Self.Color.RGB;

		static shortHexToLong(hex: Self.Color.HEX, options?: {assert?: boolean}): Self.Color.HEX;

		static getAlphaFromHex(hex: Self.Color.HEX, options?: {assert?: boolean}): number;

		static getHexWithoutAlpha(hex: Self.Color.HEX, options?: {assert?: boolean}): Self.Color.HEX;

		static cmykToRgb(cmyk: Self.Color.CMYK, options?: {assert?: boolean}): Self.Color.RGB;

		static hslToRgb(hsl: Self.Color.HSL, options?: {assert?: boolean}): Self.Color.RGB;

		static hsvToRgb(hsv: Self.Color.HSV, options?: {assert?: boolean}): Self.Color.RGB;

		static hsvToHsl(hsv: Self.Color.HSV, options?: {assert?: boolean}): Self.Color.HSL;

		static hsvToHwb(hsv: Self.Color.HSV, options?: {assert?: boolean}): Self.Color.HWB;

		static hslToHsv(hsl: Self.Color.HSL, options?: {assert?: boolean}): Self.Color.HSV;

		static hwbToHsv(hwb: Self.Color.HWB, options?: {assert?: boolean}): Self.Color.HSV;

		static labToRgb(lab: Self.Color.LAB, options?: {assert?: boolean}): Self.Color.RGB;

		static isHex(hex: Self.Color.HEX): boolean;

		static isRgb(rgb: Self.Color.RGB): boolean;

		static isCmyk(cmyk: Self.Color.CMYK): boolean;

		static isHsl(hsl: Self.Color.HSL): boolean;

		static isHsv(hsv: Self.Color.HSV): boolean;

		static isHwb(hwb: Self.Color.HWB): boolean;

		static isLab(lab: Self.Color.LAB): boolean;

		static assertHex(hex: any): void;

		static assertRgb(rgb: any): void;

		static assertCmyk(cmyk: any): void;

		static assertHsl(hsl: any): void;

		static assertHsv(hsv: any): void;

		static assertHwb(hwb: any): void;

		static assertLab(lab: any): void;

		static assert(color: any, model: Self.Color.Model): void;

		static hex(hex: Self.Color.HEX): Self.Color;

		static rgb(redOrColorObject: (number | Self.Color.RGB), green?: number, blue?: number, alpha?: number): Self.Color;

		static cmyk(cyanOrColorObject: (number | Self.Color.CMYK), magenta?: number, yellow?: number, black?: number, alpha?: number): Self.Color;

		static hsl(hueOrColorObject: (number | Self.Color.HSL), saturation?: number, lightness?: number, alpha?: number): Self.Color;

		static hsv(hueOrColorObject: (number | Self.Color.HSV), saturation?: number, value?: number, alpha?: number): Self.Color;

		static hwb(hueOrColorObject: (number | Self.Color.HWB), whiteness?: number, blackness?: number, alpha?: number): Self.Color;

		static lab(lightnessOrLabObject: (number | Self.Color.LAB), a?: number, b?: number, alpha?: number): Self.Color;

		static grayscale(grayscaleOrColorObject: (number | {grayscale: number; alpha: number}), alpha?: number): Self.Color;

		static contrastRatio(color1: Self.Color, color2: Self.Color): number;

		static contrastLevelNormalText(color1: Self.Color, color2: Self.Color): string;

		static contrastLevelLargeText(color1: Self.Color, color2: Self.Color): string;

		static isEqual(color1: (Self.Color | Self.Color.HEX | null), color2: (Self.Color | Self.Color.HEX | null)): boolean;

		static mix(color1: Self.Color, color2: Self.Color, weight?: number): Self.Color;

		static perceivedColorDifference(color1: Self.Color, color2: Self.Color): number;

		static copy(color: Self.Color): Self.Color;

		static parseColor(hexOrColor: (Self.Color | Self.Color.HEX)): (Self.Color | null);

		static formatColorToHex(hexOrColor: (Self.Color | Self.Color.HEX)): (Self.Color.HEX | null);

		static linearGradient(colorStops: globalThis.Array<(Self.Color | Self.Color.HEX | globalThis.Array<(Self.Color | Self.Color.HEX | string)>)>, angleOrDirection?: string): string;

		static radialGradient(colorStops: globalThis.Array<(Self.Color | Self.Color.HEX | globalThis.Array<(Self.Color | Self.Color.HEX | string)>)>, position?: string): string;

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

		interface LAB {
			l: number;

			a: number;

			b: number;

			alpha?: number;

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

		interface LABObject {
			object: {l: number; a: number; b: number; alpha: number};

			lightness: number;

			a: number;

			b: number;

			array: globalThis.Array<number>;

			cssString: string;

			cssStringWithAlpha: string;

		}

		interface GrayscaleObject {
			average: number;

			luminosity: number;

			lightness: number;

			cssStringAverage: string;

			cssStringLuminosity: string;

			cssStringLightness: string;

		}

		enum Model {
			HEX,
			RGB,
			CMYK,
			HSL,
			HSV,
			HWB,
			LAB,
		}

		enum Palette {
			Basic,
			Rgb,
			Cmy,
		}

		enum Type {
			ByteColorChannel,
			FloatColorChannel,
			DegreesColorChannel,
			Instance,
			Hex,
			Value,
		}

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

	export namespace Comparator {
		interface Direction {
			propertyName: string;

			comparator: Self.Comparator.Function;

		}

		type Function = (left: any, right: any) => number;

		function lessThan(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function string(ascending?: boolean, nullFirst?: boolean, caseSensitive?: boolean): Self.Comparator.Function;

		function number(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function date(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function dateTime(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function time(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function boolean(ascending?: boolean, nullFirst?: boolean): Self.Comparator.Function;

		function ofObjectProperty(propertyName: string, comparator: Self.Comparator.Function): Self.Comparator.Function;

		function ofObjectProperties(directions: globalThis.Array<Self.Comparator.Direction>): Self.Comparator.Function;

	}

	export abstract class Component implements Self.MessageHandler, Self.EventSource, Self.PropertyObservable {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		onPropertyChanged(propertyName?: string, callback?: (args: Self.PropertyObservable.EventArgs, sender: any) => void): any;

		protected _notifyPropertyChanged(propertyName: string, oldValue: any, newValue: any, reason?: (string | null)): void;

		protected constructor(options?: Self.Component.Options);

		automationId: (string | null);

		guid: string;

		parentComponent: (Self.Component | null);

		childComponents: globalThis.Set<Self.Component>;

		i18n: (Self.I18n | null);

		rtl: (boolean | null);

		context: object;

		style: object;

		initializing: boolean;

		initialized: boolean;

		disposing: boolean;

		disposed: boolean;

		computedSize: {width: number; height: number};

		visible: boolean;

		attaching: boolean;

		detaching: boolean;

		visualStyle: any;

		rendered: boolean;

		rendering: boolean;

		erasing: boolean;

		rootElement: (HTMLElement | null);

		rootAttributes: Self.HtmlAttributeList;

		rootStyle: Self.HtmlStyleList;

		classList: Self.HtmlClassList;

		enabled: boolean;

		effectiveEnabled: boolean;

		valid: (boolean | null);

		status: Self.Component.Status;

		statusMessage: (string | Self.Translation | Self.Component | Self.JSX.Element | null);

		effectiveFocusable: boolean;

		focusable: boolean;

		effectiveTabbable: boolean;

		tabbable: boolean;

		focused: boolean;

		active: boolean;

		loader: PackageComponent.Loader;

		loaderVisible: boolean;

		tooltip: (PackageComponent.Tooltip | null);

		dragSource: (Self.DataExchange.DragSourceProvider | null);

		dragTarget: (Self.DataExchange.DragTargetProvider | null);

		labelledBy: (Self.Component | Self.VDomRef | string | number | null);

		describedBy: (Self.Component | Self.VDomRef | string | number | null);

		ariaLabel: (string | Self.Translation | null);

		focusHandler: Self.FocusHandler;

		contextProvider: (context: object) => object;

		/**
		 * @deprecated
		 */
		initialize(): void;

		/**
		 * @deprecated
		 */
		dispose(): void;

		containsComponent(component: Self.Component, portal?: boolean): void;

		findParentComponent(predicate: (parent: Self.Component) => boolean, context?: Self.Component): (Self.Component | null);

		getPortal(): void;

		visitComponents(callback: (component: Self.Component) => (boolean | null), options?: {type?: Self.Component.TraversalType}): void;

		/**
		 * @deprecated Use virtual DOM
		 */
		attachTo(parentOrSelector: (HTMLElement | string), options?: {mode?: Self.Component.AttachMode; element?: Element; index?: number; parentComponent?: Self.Component}): Self.Component;

		/**
		 * @deprecated Use virtual DOM
		 */
		detach(): void;

		protected _getMessagePreFilters(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		protected _getMessagePostFilters(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

		containsElement(element: HTMLElement, options?: {isOwnElement?: boolean}): boolean;

		computeSize(includeMargin: boolean): {width: number; height: number};

		show(): void;

		hide(): void;

		focus(): void;

		setVisible(visible: boolean, options?: {reason?: string}): void;

		setEnabled(enabled: boolean, options?: {reason?: string}): void;

		setValid(value: boolean, options?: {message?: (string | Self.Translation | Self.Component | Self.JSX.Element); reason?: string}): void;

		setStatus(status: Self.Component.Status, options?: {message?: (string | Self.Translation | Self.Component | Self.JSX.Element); reason?: string; silent?: boolean}): void;

		setStatusMessage(message: (string | Self.Translation | Self.Component | Self.JSX.Element | null), options?: {reason?: (string | null); silent?: boolean}): void;

		setLoaderVisible(visible: boolean): void;

		setFocusable(value: boolean): void;

		setTabbable(value: boolean): void;

		setVisualStyle(style: any): void;

		setTooltip(tooltip: (PackageComponent.Tooltip | null)): void;

		setAutomationId(value: (string | null)): void;

		setDragSource(source: (Self.DataExchange.DragSourceProvider | null)): void;

		setDragTarget(target: (Self.DataExchange.DragTargetProvider | null)): void;

		setLabelledBy(value: (Self.Component | Self.VDomRef | string | number | null)): void;

		setDescribedBy(value: (Self.Component | Self.VDomRef | string | number | null)): void;

		setAriaLabel(ariaLabel: (string | Self.Translation | null)): void;

		addMessageFilter(filter: (Self.RoutedMessage.Filter | Record<string, Self.RoutedMessage.Handler>)): {remove: () => void};

		removeMessageFilter(filter: Self.RoutedMessage.Filter): void;

		getClassAutomationId(): (string | null);

		forceLayout(): void;

		translate(value: (string | number | Self.Translation)): string;

		private _receiveProps(oldProps: object, newProps: object): void;

		whenRendered(action: () => void): Self.EventSource.Handle;

		protected _setProp(name: string, value: any, comparator?: (left: any, right: any) => boolean): boolean;

		protected _setPrivateProp(props: object, name: string, value: any, comparator?: (left: any, right: any) => boolean): void;

		protected _setProps(props: object): void;

		protected _validateProp(name: string, value: any): void;

		protected _notifyContentUpdate(args?: object): void;

		private _addChildComponent(component: Self.Component): void;

		private _removeChildComponent(component: Self.Component): void;

		protected _refresh(args?: object): void;

		private _handleDidRender(): void;

		private _handleWillErase(): void;

		private _hookResizeListener(): void;

		private _unhookResizeListener(): void;

		private _updateEffectiveEnabled(reason?: string): void;

		private _removeFocus(): void;

		private _handleResizeEvent(args: Self.ResizeObserver.ResizeArgs): void;

		private _updateAutomationId(): void;

		private _updateAriaLabelledBy(): void;

		protected _getAriaLabelledBy(): (Self.Component | Self.VDomRef | string | number | null);

		private _updateAriaDescribedBy(): void;

		private _attachDragSourceAndTarget(rootElement: HTMLElement): void;

		private _detachDragSourceAndTarget(rootElement: HTMLElement): void;

		protected _updateAriaLabel(): void;

		private _updateValidity(previousStatus: Self.Component.Status, status: Self.Component.Status, reason: (string | null)): void;

		protected _getAriaLabel(): (string | null);

		protected _setFocusHandler(handler: Self.FocusHandler): void;

		protected _getFocusElement(): HTMLElement;

		protected _getAriaElement(): HTMLElement;

		protected _bypassMessageOnDisabledComponent(message: Self.RoutedMessage): boolean;

		protected _onFocusIn(args: {element: HTMLElement; component: Self.Component}): void;

		protected _onFocusOut(args: {nextFocusedElement: (Element | null); nextFocusedComponent: (Self.Component | null); focusedComponent: Self.Component}): void;

		protected _onFocusMoved(args: {element: HTMLElement; component: Self.Component}): void;

		protected _onActivated(args: {element: HTMLElement; component: Self.Component}): void;

		protected _onDeactivated(args: {nextFocusedElement: (Element | null); nextFocusedComponent: (Self.Component | null); focusedComponent: Self.Component}): void;

		protected _onCaptureClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCaptureDoubleClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCaptureWheel(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerMove(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerLeave(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerEnter(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerOver(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerOut(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerUp(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCapturePointerDown(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onCaptureKeyDown(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onCaptureKeyUp(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onCaptureKeyPress(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onKeyDown(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onKeyUp(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onKeyPress(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onDoubleClick(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerLeave(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerEnter(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerMove(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerUp(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerDown(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerOver(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onPointerOut(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onWheel(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onScroll(message: Self.ViewMessage, result: Self.RoutedMessage.Result): void;

		protected _onPaste(message: Self.ClipboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onCut(message: Self.ClipboardMessage, result: Self.RoutedMessage.Result): void;

		protected _onSelect(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		protected _onInput(message: Self.ValueChangeMessage, result: Self.RoutedMessage.Result): void;

		protected _onContextMenu(message: Self.PointerMessage, result: Self.RoutedMessage.Result): void;

		/**
		 * @deprecated
		 */
		protected _onInitialize(): void;

		/**
		 * @deprecated
		 */
		protected _onDispose(): void;

		protected _onRender(context: object, css: object): (HTMLElement | Self.JSX.Element | Self.Component);

		protected _onAfterRender(context: object): void;

		protected _onAfterUpdate(context: object): void;

		protected _onBeforeErase(context: object): void;

		/**
		 * @deprecated
		 */
		protected _onErase(context: object): void;

		protected _onLayout(): void;

		protected _onVisibleChanged(args: object): void;

		protected _onVisualStyleChanged(args: object): void;

		protected _onResize(args: Self.Component.ResizeArgs): void;

		protected _onEnabledChanged(args: {enabled: boolean; previousEnabled: boolean; reason?: string}): void;

		protected _onEffectiveEnabledChanged(args: {effectiveEnabled: boolean; previousEffectiveEnabled: boolean; reason?: string}): void;

		protected _onValidityChanged(args: {valid: boolean; previousValid: boolean; reason?: string}): void;

		protected _onContentUpdated(args: {component: Self.Component}): boolean;

		protected _onStatusChanged(args: {status: Self.Component.Status; previousStatus: Self.Component.Status; reason?: string}): void;

		protected _onStatusMessageChanged(args: {message: (string | Self.Translation | Self.Component); previousMessage: (string | Self.Translation | Self.Component); reason?: string}): void;

		private _onAriaLabelChanged(args: {ariaLabel: (string | Self.Translation | null); previousAriaLabel: (string | Self.Translation | null)}): void;

		protected _onContentMeasurementStarted(): void;

		protected _onContentMeasurementFinalized(): void;

		protected _onProvideContext(context: object): object;

		protected _onReceiveProp(name: string, oldValue: any, newValue: any): void;

		protected _onUnsetProp(key: string): any;

		protected _onShouldUpdate(): void;

		static Event: Self.Component.EventTypes;

		static findByElement(element: Element, context?: Element): (Self.Component | null);

		static props(Class: (options: any) => any, options: object, deepExtend?: boolean): object;

		static contextTypes: globalThis.Array<string>;

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

	class ComponentFocusHandler {
		constructor(args: {focusable?: boolean; tabbable?: boolean; component?: Self.Component});

		effectiveFocusable: boolean;

		focusable: boolean;

		effectiveTabbable: boolean;

		tabbable: boolean;

		focusComponent: Self.Component;

		update(): void;

		focus(): boolean;

		isFocused(focusComponent: Self.Component): boolean;

		static factory(args: object): Self.ComponentFocusHandler;

	}

	namespace ComponentFocusHandler {
	}

	class ComputedTranslation extends Self.Translation {
		constructor(callback: (i18n: Self.I18n) => string);

	}

	namespace ComputedTranslation {
	}

	export class Context implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options?: Self.Context.Options);

		parent: (Self.Context | null);

		name: string;

		children: globalThis.Array<Self.Context>;

		root: Self.Context;

		services: Self.HierarchicalMap;

		state: object;

		routeState: Self.Route.State;

		disposed: boolean;

		createChild(options?: Self.Context.Options): Self.Context;

		setState(state: object): void;

		subscribe(topic: string, handler: (args: object) => void): {remove: () => void};

		publish(topic: string, args?: object, options?: {mode?: Self.Context.EventMode}): void;

		dispatchAction(action: (Self.Reducer.Action | string), payload?: any): void;

		routeTo(route: Self.Route, parameters?: object, modifiers?: {replace?: boolean}): void;

		setRoute(routeState: Self.Route.State): void;

		isChildOf(parent: Self.Context): boolean;

		dispose(): void;

		getServices(): void;

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

		enum EventMode {
			ALL,
			BROADCAST,
			LOCAL,
			SCOPE,
		}

	}

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

		static DATA_EXCHANGE_MANAGER: string;

		static WINDOW_MANAGER: string;

		static THEME: string;

		static THEME_BACKGROUND: string;

		static AVAILABLE_THEMES: string;

		static PREFERRED_THEME: string;

		static DEBUG: string;

		static FORMAT: string;

		static APP: string;

		static FORM: string;

		static LOGGING: string;

		static DISPATCH: string;

		static STORE: string;

		static WINDOW: string;

		static PROMOTION: string;

		static new(name: string): string;

	}

	export namespace ContextType {
	}

	namespace Cookies {
		function get(key: string): string;

		function set(key: string, value: string, options: object): void;

		function expire(key: string, options: object): void;

	}

	export class Counter {
		constructor(first?: number, increment?: number);

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

		function buildDragSource(options: {onProvideSourceData: (args: Self.DataExchange.ProvideSourceDataArgs) => any; decorator?: (args: Self.DataExchange.DragSourceProviderArgs) => Self.DataExchange.SourceDecorator; targetDecorator?: (args: Self.DataExchange.DragSourceProviderArgs) => Self.DataExchange.TargetDecorator; onInitializeGhost?: (args: Self.DataExchange.InitializeGhostArgs) => void; onCancel?: (args: Self.DataExchange.EndArgs) => void; onCommit?: (args: Self.DataExchange.CommitArgs) => void}): Self.DataExchange.DragSourceProvider;

		function buildDragTarget(options: {same?: boolean; onValidateExchange?: (args: Self.DataExchange.DragTargetProviderArgs) => boolean; onProvideTargetData: (args: Self.DataExchange.ProvideTargetDataArgs) => any; onCompareData: (left: any, right: any) => boolean; onCommit: (args: Self.DataExchange.CommitArgs) => void; decorator?: (args: Self.DataExchange.DragTargetProviderArgs) => Self.DataExchange.TargetDecorator}): Self.DataExchange.DragTargetProvider;

	}

	export class DataExchangeManager implements Self.MessageHandler {
		constructor();

		dragging: boolean;

		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: object): void;

	}

	export namespace DataExchangeManager {
	}

	export interface DataSource<T = any> extends Self.EventSource {
		query(args: Self.DataSource.QueryArguments<T>, resolve: (args: {items: globalThis.Array<T>}) => void, reject?: (error: any) => void): void;

	}

	export namespace DataSource {
		interface QueryArguments<T = any> {
			item?: T;

			index?: number;

			count?: number;

			cancellationToken?: Self.CancellationToken;

		}

		type QueryCallback<T = any> = (args: Self.DataSource.QueryArguments<T>, resolve: (args: {items: globalThis.Array<T>}) => void, reject: (error: any) => void) => void;

		interface EventType {
			UPDATED: string;

		}

		const Type: Self.Type.Matcher;

		function is(value: any): boolean;

		function queryPromise<T = any>(dataSource: Self.DataSource<T>, args?: Self.DataSource.QueryArguments<T>): globalThis.Promise<{items: globalThis.Array<T>}>;

		function create<T = any>(query: (args: Self.DataSource.QueryArguments<T>, resolve: (args: {items: globalThis.Array<T>}) => void, reject: (error: any) => void) => void): Self.GenericDataSource<T>;

		function queryAll<T = any>(dataSource: Self.DataSource<T>): globalThis.Promise<globalThis.Array<T>>;

		enum UpdateType {
			ADD,
			REMOVE,
			MOVE,
			RESET,
		}

		const Event: Self.DataSource.EventType;

	}

	export class DataStore {
		constructor();

		rootEntry: Self.DataStoreEntry;

		dataSource: (Self.DataSource | null);

		empty: boolean;

		bindDataSource(dataSource: Self.DataSource): void;

		unbindDataSource(): void;

		update(update: object, args: object): void;

		entryForDataItem(dataItem: any): any;

		visit(callback: (entry: Self.DataStoreEntry) => (boolean | null)): void;

		dispose(): void;

	}

	export namespace DataStore {
	}

	class DataStoreEntry {
	}

	namespace DataStoreEntry {
	}

	export class Date {
		constructor(yearOrDate?: (number | string | globalThis.Date), monthIndex?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number);

		dayOfWeek: number;

		day: number;

		month: number;

		year: number;

		hours: number;

		minutes: number;

		seconds: number;

		milliseconds: number;

		millisecondsSinceEpoch: number;

		utcDay: number;

		utcMonth: number;

		utcYear: number;

		utcHours: number;

		utcMinutes: number;

		utcSeconds: number;

		utcMilliseconds: number;

		timezoneOffset: number;

		isValid(): boolean;

		stripTime(): Self.Date;

		stripDayAndTime(): Self.Date;

		addDay(num: number): Self.Date;

		addWeek(num: number): Self.Date;

		addMonth(num: number): Self.Date;

		addYear(num: number): Self.Date;

		addHour(num: number): Self.Date;

		addMinute(num: number): Self.Date;

		addSecond(num: number): Self.Date;

		addMillisecond(num: number): Self.Date;

		setDay(day: number): Self.Date;

		setMonth(month: number): Self.Date;

		setYear(year: number): Self.Date;

		setHours(hours: number): Self.Date;

		setMinutes(minutes: number): Self.Date;

		setSeconds(seconds: number): Self.Date;

		setMilliseconds(milliseconds: number): Self.Date;

		nextDay(): Self.Date;

		prevDay(): Self.Date;

		compare(date: Self.Date, dateOnly?: boolean): number;

		equals(date: (Self.Date | null), dateOnly?: boolean): boolean;

		before(date: Self.Date, dateOnly?: boolean): boolean;

		beforeOrEqual(date: Self.Date, dateOnly?: boolean): boolean;

		after(date: Self.Date, dateOnly?: boolean): boolean;

		afterOrEqual(date: Self.Date, dateOnly?: boolean): boolean;

		clone(): Self.Date;

		toString(): string;

		setUTCDay(day: number): Self.Date;

		setUTCMonth(month: number): Self.Date;

		setUTCYear(year: number): Self.Date;

		setUTCHours(hours: number): Self.Date;

		setUTCMinutes(minutes: number): Self.Date;

		setUTCSeconds(seconds: number): Self.Date;

		setUTCMilliseconds(milliseconds: number): Self.Date;

		toJSON(): string;

		toDate(): globalThis.Date;

		toDateString(): string;

		toISOString(): string;

		toLocaleDateString(): string;

		toLocaleString(): string;

		toLocaleTimeString(): string;

		toTimeString(): string;

		toUTCString(): string;

		closestDayOfWeek(dayOfWeek: number, forward?: boolean): Self.Date;

		firstOfMonth(): Self.Date;

		lastOfMonth(): Self.Date;

		firstOfYear(): Self.Date;

		lastOfYear(): Self.Date;

		weekNumber(firstDayOfWeek?: number): number;

		static getWeek(year: number, firstDayOfWeek: number, number: number): Self.Date;

		static fromDate(date: (globalThis.Date | null)): (Self.Date | null);

		static fromMillisecondsSinceEpoch(value: number): Self.Date;

		static fromTimeStamp(timeStamp: number): Self.Date;

		static now(): Self.Date;

		static today(): Self.Date;

		static thisMonth(): Self.Date;

		static equals(left: (Self.Date | null), right: (Self.Date | null), dateOnly?: boolean): boolean;

		static dateOnlyEquals(left: (Self.Date | null), right: (Self.Date | null)): boolean;

		static dateTimeEquals(left: (Self.Date | null), right: (Self.Date | null)): boolean;

		static thisYear(): Self.Date;

		static millisecondsSinceEpoch(): number;

		static millisecondsBetween(start: Self.Date, end: Self.Date): number;

		static secondsBetween(start: Self.Date, end: Self.Date): number;

		static minutesBetween(start: Self.Date, end: Self.Date): number;

		static hoursBetween(start: Self.Date, end: Self.Date): number;

		static daysBetween(start: Self.Date, end: Self.Date): number;

		static weeksBetween(start: Self.Date, end: Self.Date): number;

		static monthsBetween(start: Self.Date, end: Self.Date): number;

		static yearsBetween(start: Self.Date, end: Self.Date): number;

	}

	export namespace Date {
		enum Format {
			isoDate,
			isoTime,
			isoDateTime,
		}

	}

	class DateFormat {
	}

	namespace DateFormat {
	}

	export class Decorator {
		constructor(options?: Self.Decorator.Options);

		attributes(context: object): object;

		styles(css: object, context: object): globalThis.Array<Self.Style>;

		context(context: object): (object | null);

		static background(args: Self.Decorator.ColorOptions): Self.Decorator;

		static border(args: Self.Decorator.BorderOptions): Self.Decorator;

		static font(args: Self.Decorator.FontOptions): Self.Decorator;

		static margin(args: (Self.Decorator.Margin | Self.Decorator.BoxOptions)): Self.Decorator;

		static padding(args: (Self.Decorator.Padding | Self.Decorator.BoxOptions)): Self.Decorator;

		static shape(shape: Self.Decorator.Shape): Self.Decorator;

		static depth(depth: Self.Decorator.Depth): Self.Decorator;

		static custom(options: Self.Decorator.Options): Self.Decorator;

		static combine(...decorators: globalThis.Array<Self.Decorator>): Self.Decorator;

		static styles(decorator: (Self.Decorator | null), css: object, context: object): globalThis.Array<Self.Style>;

		static attributes(decorator: (Self.Decorator | null), context: object): object;

		static context(decorator: (Self.Decorator | null), context: object): object;

		static getStyles(theme: Self.Theme): object;

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

		interface Options {
			background?: Self.Decorator.ColorOptions;

			border?: Self.Decorator.BorderOptions;

			margin?: Self.Decorator.BoxOptions;

			padding?: Self.Decorator.BoxOptions;

			depth?: Self.Decorator.Depth;

			shape?: Self.Decorator.Shape;

			font?: Self.Decorator.FontOptions;

		}

		enum BorderWeight {
			NONE,
			DEFAULT,
			MEDIUM,
			THICK,
		}

		enum BorderType {
			SOLID,
			DASHED,
			DOTTED,
		}

		enum Shape {
			SQUARE,
			ROUNDED_SMALL,
			ROUNDED_LARGE,
		}

		enum Depth {
			SMALL,
			MEDIUM,
			LARGE,
		}

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
			SPACING1X,
			SPACING2X,
			SPACING3X,
			SPACING4X,
			SPACING5X,
			SPACING6X,
			SPACING7X,
			SPACING8X,
			SPACING9X,
			SPACING10X,
			SPACING11X,
			SPACING12X,
			TINY,
			SMALL,
			MEDIUM,
			LARGE,
		}

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
			SPACING1X,
			SPACING2X,
			SPACING3X,
			SPACING4X,
			SPACING5X,
			SPACING6X,
			SPACING7X,
			SPACING8X,
			SPACING9X,
			SPACING10X,
			SPACING11X,
			SPACING12X,
			TINY,
			SMALL,
			MEDIUM,
			LARGE,
		}

		enum Color {
			NEUTRAL,
			THEMED,
			DANGER,
			WARNING,
			SUCCESS,
			INFO,
			WHITE,
		}

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

		enum FontWeight {
			NORMAL,
			SEMIBOLD,
			BOLD,
		}

		enum FontSize {
			SMALLER,
			SMALL,
			REGULAR,
			MEDIUM,
			LARGE,
			LARGER,
			LARGEST,
		}

		enum FontStyle {
			NORMAL,
			ITALIC,
		}

		enum TextDecoration {
			UNDERLINE,
		}

	}

	export class DeviceMetadataService implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options?: Self.DeviceMetadataService.Options);

		deviceType: string;

		viewport: string;

		orientation: string;

		screenInfo: Self.DeviceMetadataService.ScreenInfo;

		private _setMediaQueries(): void;

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
		constructor(options: Self.DragDropGhost.Options);

		content: (Self.Component | Self.JSX.Element | null);

		offset: Self.DragDropGhost.Offset;

		icon: (Self.Component | Self.JSX.Element | null);

		initializeFromElement(element: Element, cursorPosition: Self.PointerMessage.Position): void;

		setContent(content: (Self.Component | Self.JSX.Element | null)): void;

		setOffset(offset: Self.DragDropGhost.Offset): void;

		setIcon(icon: (Self.Component | Self.JSX.Element | null)): void;

		static cloneElement(element: Element): Self.JSX.Element;

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
		function addClasses(element: Element, classes: (string | globalThis.Array<any> | object | Self.Style)): void;

		function addData(element: Element, data: object): void;

		function applyAttributes(element: Element, attributes: (null | undefined | string | globalThis.Array<any> | object)): void;

		function addChildren(element: Element, children: any): void;

		function makeElement(elementName: string, attributes: (string | globalThis.Array<any> | object | null), children: any): HTMLElement;

		function makeElementNS(ns: string, elementName: string, attributes: (string | globalThis.Array<any> | object | null), children: any): Element;

	}

	export class EventBus {
		constructor();

		subscribe(sender: (string | object), listener: (((args: object) => void) | Self.EventBusListener)): {remove: () => void};

		publish(sender: (string | object), notification: object): void;

	}

	export namespace EventBus {
	}

	export interface EventBusListener {
		process(args: object): void;

	}

	export namespace EventBusListener {
	}

	export interface EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

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

	export class ExclusiveTabbableFocusHandler {
		constructor();

		effectiveFocusable: boolean;

		focusable: boolean;

		effectiveTabbable: boolean;

		tabbable: boolean;

		focusComponent: Self.Component;

		activeHandler: (Self.FocusHandler | null);

		update(): void;

		focus(): boolean;

		isFocused(focusComponent: Self.Component): boolean;

		addHandler(handler: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		removeHandler(handler: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		setHandlers(handlers: (Self.FocusHandler | globalThis.Array<Self.FocusHandler>)): void;

		setActiveHandler(handler: Self.FocusHandler): void;

		static factory(args: object): Self.ExclusiveTabbableFocusHandler;

	}

	export namespace ExclusiveTabbableFocusHandler {
	}

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

	export class FlagGenerator {
		constructor(seed: number);

		next(): number;

	}

	export namespace FlagGenerator {
	}

	export class Flags {
		constructor(value: number);

		value: number;

		is(flagCombination: number): boolean;

		set(flagCombination: number): Self.Flags;

		unset(flagCombination: number): Self.Flags;

		flip(flagCombination: number): Self.Flags;

		toggle(flagCombination: number, toggle: boolean): Self.Flags;

		diff(flagCombination: (number | Self.Flags)): Self.Flags;

		copy(): Self.Flags;

		clear(): Self.Flags;

		static is(value: number, flagCombination: number): boolean;

		static set(value: number, flagCombination: number): number;

		static unset(value: number, flagCombination: number): number;

		static flip(value: number, flagCombination: number): number;

		static toggle(value: number, flagCombination: number, toggle: boolean): number;

		static diff(left: number, right: number): number;

	}

	export namespace Flags {
	}

	class FloatFormat {
	}

	namespace FloatFormat {
	}

	export interface FocusHandler {
		effectiveFocusable: boolean;

		focusable: boolean;

		effectiveTabbable: boolean;

		tabbable: boolean;

		focusComponent: Self.Component;

		update(): void;

		focus(): void;

		isFocused(focusComponent: Self.Component): boolean;

	}

	export namespace FocusHandler {
	}

	export class FocusManager implements Self.MessageHandler {
		constructor();

		focusedElement: (Element | null);

		focusedComponent: (Self.Component | null);

		getNextFocusableElementInDirection(forward: boolean, focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		getNextFocusableElement(focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		getPreviousFocusableElement(focusedElement?: Element, context?: Element, tabbable?: boolean): (Element | null);

		focusNextElement(focusedElement?: Element, context?: Element, tabbable?: boolean): boolean;

		focusPreviousElement(focusedElement?: Element, context?: Element, tabbable?: boolean): boolean;

		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace FocusManager {
	}

	export class FocusMessage extends Self.RoutedMessage {
		constructor(options: Self.FocusMessage.Options);

		element: Element;

		nextFocusedElement: Element;

		nextFocusedComponent: Self.Component;

		previousFocusedElement: Element;

		previousFocusedComponent: Self.Component;

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

	export enum Format {
		DATE,
		DATE_TIME,
		TIME,
		INTEGER,
		FLOAT,
	}

	export class FormatService {
		constructor(formats?: object);

		format(value: any, format: Self.FormatService.Format, options?: object): string;

		parse(value: any, format: Self.FormatService.Format, options?: object): any;

		with(formats: object): Self.FormatService;

		static forI18n(i18n: Self.I18n): Self.FormatService;

	}

	export namespace FormatService {
		export import Format = Self.Format;

	}

	export namespace Function {
		function VOID(): void;

		function NULL(): null;

		function IDENTITY(value: any): any;

		function STRICT_EQUALS(left: any, right: any): boolean;

		function TRUE(): boolean;

		function FALSE(): boolean;

		function VALUE(value: any): () => any;

		function throttle(callback: (...args: globalThis.Array<any>) => void, interval?: number): (...args: globalThis.Array<any>) => void;

		function debounce(callback: (...args: globalThis.Array<any>) => void, interval?: number): (...args: globalThis.Array<any>) => void;

		function runAll(list: globalThis.Array<() => void>): void;

		function memoize(func: (arg: any) => any): (arg: any) => any;

		function memoizeLast(func: (arg: any) => any): (arg: any) => any;

		function runSafely<T>(callback?: () => T, errorCallback?: (error: Error) => T): T;

	}

	class GenericDataSource<T = any> implements Self.DataSource<T>, Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(query: Self.DataSource.QueryCallback<T>);

		query(args: object, resolve: (args: {items: globalThis.Array<T>}) => void, reject: (error: any) => void): void;

	}

	namespace GenericDataSource {
	}

	export function HashRouter(props?: {children?: Self.VDom.Children}): Self.JSX.Element;

	export class HierarchicalMap {
		constructor(parent?: Self.HierarchicalMap);

		parent: (Self.HierarchicalMap | null);

		add(key: any, value: any): void;

		remove(key: any): any;

		get(key: any): any;

		has(key: any): boolean;

		clear(): void;

		flatten(recursive?: boolean): object;

	}

	export namespace HierarchicalMap {
	}

	export namespace Hook {
		type EffectCleanupCallback = () => void;

		function useState<T = any>(initialState: T): [T, (state: T) => void];

		function useEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

		function useLayoutEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

		function useContext<T = any>(type: string): T;

		function useStyles(provider: (theme: Self.Theme) => object): any;

		function useReducer(reducer: (state: any, action: object) => any, initialState: any): [any, (action: object) => any];

		function useRef<T = any>(initialValue?: T): Self.VDomRef<T>;

		function useCallback<T extends Function>(callback: T, dependencies?: globalThis.Array<any>): T;

		function useMemo<T>(create: () => T, dependencies?: globalThis.Array<any>): T;

		function useDispatch(): Self.Store.DispatchFunc;

		function useSelector<State, Selected>(selector: (state: State) => Selected, equalityFn?: (left: Selected, right: Selected) => boolean): Selected;

		function useId(): string;

	}

	export namespace Html {
		function getScrollbarWidth(): number;

		function getParent(startElement: Node, selector?: (string | ((element: Element) => boolean)), stopElement?: Node): (Node | null);

		function getChildren(parent: HTMLElement, selector: (string | ((element: Element) => boolean)), findFirstN?: number): globalThis.Array<Node>;

		function getChild(parent: HTMLElement, selector: (string | ((element: Element) => boolean)), index?: number): HTMLElement;

		function getDataFromJSON(elementID: string): object;

		function appendChild(parent: Element, element: Element): void;

		function appendChildren(parent: Element, elements: globalThis.Array<Element>): void;

		function prependChild(parent: Element, element: Element): void;

		function insertChild(parent: Element, element: Element, index?: number): void;

		function insertBefore(target: Node, element: Node): void;

		function insertAfter(target: Node, element: Node): void;

		function replaceElement(newElement: Element, element: Element): Element;

		function detach(element: Node): void;

		function clear(element: HTMLElement): void;

		function copyAttributes(source: Element, destination: Element, overwrite?: boolean): void;

		function clearAttributes(element: HTMLElement): void;

		function getElementOffset(element: HTMLElement, baseElement: HTMLElement): {top: number; left: number};

		function getDocumentOffset(element: HTMLElement): {top: number; left: number};

		function viewportToDocumentCoordinates(box: {top: number; left: number; height: number; width: number}): {top: number; left: number; height: number; width: number};

		function documentBorderBox(element: HTMLElement): {top: number; left: number; width: number; height: number};

		function documentMarginBox(element: HTMLElement): {top: number; left: number; width: number; height: number};

		function viewportContentBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		function viewportBorderBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		function viewportMarginBox(element: HTMLElement): {top: number; left: number; height: number; width: number};

		function documentBox(): Self.Rectangle;

		function windowBox(): {top: number; left: number; height: number; width: number};

		function naturalSize(element: HTMLElement): {width: number; height: number};

		function offsetBox(element: Element): {top: number; left: number; width: number; height: number};

		function isFocusableElement(element: HTMLElement, tabbable?: boolean): boolean;

		function copyElementToClipboard(element: Element): void;

		function clearSelection(): void;

		function isElementVisible(element: Element): boolean;

		function waitDocumentReady(): globalThis.Promise<void>;

		function loadScript(url: string, customize?: (script: HTMLScriptElement) => void): globalThis.Promise<void>;

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

	export class HtmlAttributeList {
		constructor(attributes?: Record<string, string>, options?: {onChange?: Self.HtmlAttributeList.ChangeCallback});

		applyToElement(element: HTMLElement): void;

		get(name: string): (string | null);

		set(name: (string | Record<string, string>), value?: (string | boolean)): void;

		remove(name: (string | globalThis.Array<string>)): void;

		addEntry(name: (string | Record<string, (string | boolean | globalThis.Array<string>)>), value?: (string | boolean | globalThis.Array<string>)): void;

		removeEntry(name: (string | Record<string, (string | boolean | globalThis.Array<string>)>), value?: (string | boolean | globalThis.Array<string>)): void;

		toggle(name: string, value: (string | null)): void;

		has(name: string): boolean;

		clear(): void;

		setIf(key: string, value: string, condition: boolean): void;

		applyDiff(oldValue: Record<string, string>, newValue: Record<string, string>): void;

	}

	export namespace HtmlAttributeList {
		type ChangeCallback = (added: Record<string, string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	export class HtmlClassList {
		constructor(classList?: Self.HtmlClassList.ClassList, options?: {onChange?: Self.HtmlClassList.ChangeCallback});

		applyToElement(element: HTMLElement): void;

		add(classNames: (string | globalThis.Array<string>)): void;

		remove(classNames: (string | globalThis.Array<string>)): void;

		toggle(classNames: (string | globalThis.Array<string> | Record<string, boolean>), value?: boolean): void;

		has(className: (string | Self.Style)): boolean;

		applyDiff(oldValue: Self.HtmlClassList.ClassList, newValue: Self.HtmlClassList.ClassList): void;

	}

	export namespace HtmlClassList {
		type ClassList = (string | Self.Style | globalThis.Array<(string | Self.Style)> | Record<string, boolean>);

		type ChangeCallback = (added: globalThis.Array<string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	export class HtmlStyleList {
		constructor(style?: Record<string, string>, options?: {onChange?: Self.HtmlStyleList.ChangeCallback});

		applyToElement(element: HTMLElement): void;

		get(name: string): (string | null);

		set(name: (string | Record<string, string>), value?: string): void;

		remove(name: (string | globalThis.Array<string>)): void;

		toggle(name: string, value: (string | null)): void;

		has(name: string): boolean;

		clear(): void;

		applyDiff(oldValue: Record<string, string>, newValue: Record<string, string>): void;

	}

	export namespace HtmlStyleList {
		type ChangeCallback = (added: Record<string, string>, removed: globalThis.Array<string>, applyToElement: (element: Element) => void) => void;

	}

	export class HttpPostDataFormatter extends Self.LogFormatter {
		constructor();

	}

	export namespace HttpPostDataFormatter {
	}

	export class I18n {
		constructor(options?: Self.I18n.Options);

		dateFormat: string;

		timeFormat: string;

		monthLabels: {short: globalThis.Array<string>; long: globalThis.Array<string>};

		dayLabels: {short: globalThis.Array<string>; long: globalThis.Array<string>};

		amPmLabels: globalThis.Array<string>;

		firstDayOfWeek: number;

		rtl: boolean;

		language: string;

		choiceFormat: (RegExp | boolean);

		get(args: (string | Self.I18n.GetParam)): string;

		set(args: {key?: string; text?: string}): Self.I18n;

		remove(args: {key?: string}): Self.I18n;

		clear(): Self.I18n;

		addBundle(bundle: Self.I18n.TranslationBundle): Self.I18n;

		compare(left: string, right: string): number;

		static fromBundle(translations: object): Self.I18n;

		static fromLocale(locale: object, options: object): Self.I18n;

	}

	export namespace I18n {
		interface Options {
			rtl?: boolean;

			language?: string;

			firstDayOfWeek?: number;

			dateFormat?: string;

			timeFormat?: string;

			choiceFormatPattern?: (RegExp | boolean);

			amPmLabels?: globalThis.Array<string>;

			monthLabels?: {short: globalThis.Array<string>; long: globalThis.Array<string>};

			dayLabels?: {short: globalThis.Array<string>; long: globalThis.Array<string>};

			missingTranslationWarning?: boolean;

			translations?: Self.I18n.TranslationBundle;

		}

		type TranslationBundle = Record<string, string>;

		interface GetParam {
			key: string;

			default?: string;

			params?: object;

		}

	}

	namespace ImageConstant {
		enum Size {
			XXS,
			XS,
			S,
			M,
			L,
			XL,
			XXL,
		}

		enum BorderRadius {
			SQUARE,
			ROUNDED,
			ROUND,
		}

		enum Color {
			NEUTRAL,
			THEMED,
			DANGER,
			WARNING,
			SUCCESS,
			INFO,
			WHITE,
		}

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

	export class ImageMetadata {
		constructor(options?: (Self.ImageMetadata.Options | string));

		caption: (string | Self.Translation | null);

		url: (string | null);

		rtlSensitive: boolean;

		getOptions(theme?: Self.Theme): Self.ImageMetadata.Options;

		withStyleable(styleable: boolean): Self.ImageMetadata;

		withSize(widthOrSize: (string | number | Self.ImageMetadata.Size), height?: (string | number)): Self.ImageMetadata;

		withNoSize(): Self.ImageMetadata;

		withCaption(caption: (string | Self.Translation)): Self.ImageMetadata;

		withDefaultCaption(defaultCaption: string): Self.ImageMetadata;

		withClassName(name: string): Self.ImageMetadata;

		withOffset(offset: object): Self.ImageMetadata;

		withOptions(options: object): Self.ImageMetadata;

		addClass(className: string): Self.ImageMetadata;

		withUrl(url: string): Self.ImageMetadata;

		withRTLSensitive(rtlSensitive: boolean): Self.ImageMetadata;

		withThemeSpecificOptions(themeSpecificOptions: (theme: Self.Theme) => object): Self.ImageMetadata;

		private _clone(options: object): Self.ImageMetadata;

		static create(options: (string | Self.Url | globalThis.Array<string> | Self.ImageMetadata | Self.ImageMetadata.Options)): Self.ImageMetadata;

		static withUrl(url: string): Self.ImageMetadata;

		static withClassName(classList: (string | globalThis.Array<string>)): Self.ImageMetadata;

		static withCaption(caption: string): Self.ImageMetadata;

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

	export class ImmutableArray {
		constructor(array?: globalThis.Array<any>);

		[Symbol.iterator](): any;

		empty: boolean;

		length: number;

		firstItem: (null | any);

		lastItem: (null | any);

		firstItemOrDefault(defaultValue: any): any;

		lastItemOrDefault(defaultValue: any): any;

		at(index: number): (null | any);

		push(item: any): Self.ImmutableArray;

		pop(): Self.ImmutableArray;

		insert(index: number, item: any): Self.ImmutableArray;

		remove(value: any): Self.ImmutableArray;

		removeAt(index: number, count?: number): Self.ImmutableArray;

		concat(array: Self.ImmutableArray): Self.ImmutableArray;

		filter(filter: (item: any, index: number) => boolean): Self.ImmutableArray;

		map(transform: (item: any, index: number) => any): Self.ImmutableArray;

		sort(comparator: (left: any, right: any) => number): Self.ImmutableArray;

		toArray(): globalThis.Array<any>;

		static range(from: number, count: number, step?: number): Self.ImmutableArray;

		static repeat(value: any, count: number): Self.ImmutableArray;

		static set(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		static push(array: globalThis.Array<any>, item: any): globalThis.Array<any>;

		static pop(array: globalThis.Array<any>): any;

		static shift(array: globalThis.Array<any>, count?: number): globalThis.Array<any>;

		static unshift(array: globalThis.Array<any>, item: any): globalThis.Array<any>;

		static unshiftAll(array: globalThis.Array<any>, items: globalThis.Array<any>): globalThis.Array<any>;

		static insert(array: globalThis.Array<any>, index: number, item: any): globalThis.Array<any>;

		static insertAll(array: globalThis.Array<any>, index: number, items: globalThis.Array<any>): globalThis.Array<any>;

		static reorder(array: globalThis.Array<any>, fromIndex: number, toIndex: number, count?: number): globalThis.Array<any>;

		static reverse(array: globalThis.Array<any>): globalThis.Array<any>;

		static remove(array: globalThis.Array<any>, value: any): globalThis.Array<any>;

		static removeAt(array: globalThis.Array<any>, index: number, count?: number): globalThis.Array<any>;

		static removeAll(array: globalThis.Array<any>, values: globalThis.Array<any>): globalThis.Array<any>;

		static filter(array: globalThis.Array<any>, filter: (item: any, index: number) => boolean): globalThis.Array<any>;

		static map(array: globalThis.Array<any>, transform: (item: any, index: number) => any): globalThis.Array<any>;

		static sort(array: globalThis.Array<any>, comparator: (left: any, right: any) => number): globalThis.Array<any>;

		static EMPTY: Self.ImmutableArray;

	}

	export namespace ImmutableArray {
	}

	export namespace ImmutableObject {
		function set(source: object, path: (globalThis.Array<string> | string | object), value?: any): object;

		function update(source: object, path: (globalThis.Array<string> | string), updater: (value: any) => any): object;

		function merge(target: object, source: object): object;

		function remove(source: object, path: (globalThis.Array<string> | string)): object;

		function mapValues(object: object, mapper: (key: string, value: any) => any): object;

		const NO_VALUE: object;

	}

	export class ImmutableSet {
		constructor(iterable?: Iterable<any>);

		[Symbol.iterator](): any;

		values: globalThis.Array<any>;

		size: number;

		empty: boolean;

		add(value: any): Self.ImmutableSet;

		addAll(values: globalThis.Array<any>): Self.ImmutableSet;

		delete(value: any): Self.ImmutableSet;

		deleteAll(values: globalThis.Array<any>): Self.ImmutableSet;

		toggle(item: any, add?: boolean): Self.ImmutableSet;

		toggleAll(items: globalThis.Array<any>, add?: boolean): Self.ImmutableSet;

		has(value: any): boolean;

		hasAll(values: globalThis.Array<any>): boolean;

		hasAny(values: globalThis.Array<any>): boolean;

		contains(anotherSet: Self.ImmutableSet): boolean;

		equals(anotherSet: Self.ImmutableSet): boolean;

		union(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		intersect(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		subtract(anotherSet: Self.ImmutableSet): Self.ImmutableSet;

		forEach(callback: (item: any) => void, context: any): void;

		filter(predicate: (item: any) => boolean, context: any): Self.ImmutableSet;

		map(transform: (item: any) => any, context: any): Self.ImmutableSet;

		static fromValues(...values: globalThis.Array<any>): Self.ImmutableSet;

		static fromArray(array: globalThis.Array<any>): Self.ImmutableSet;

		static EMPTY: Self.ImmutableSet;

	}

	export namespace ImmutableSet {
	}

	export namespace ImmutableUpdate {
		function of<T extends object>(base: T, recipe: (draft: T) => (void | T), plugins?: globalThis.Array<any>): T;

	}

	export interface InputComponent {
		inputId: string;

		inputAttributes: Self.HtmlAttributeList;

		empty: boolean;

		mandatory: boolean;

	}

	export namespace InputComponent {
	}

	export interface InputController {
		attach(component: Self.Component): void;

		detach(): void;

		reset(): void;

		filterMessage(message: object, result: object): void;

		handleMessage(message: object, result: object): void;

	}

	export namespace InputController {
	}

	class IntegerFormat {
	}

	namespace IntegerFormat {
	}

	export class Interface extends Self.InterfaceMarker {
		constructor(definition: Self.Interface.Options);

		name: string;

		id: number;

		parentInterfaces: globalThis.Array<Self.Interface>;

		methods: object;

		properties: object;

		transitiveParents: object;

		verify(descriptor: Self.ClassDescriptor, name: string): void;

		isImplementedBy(obj: object): boolean;

		isChildOf(superInterface: Self.Interface): void;

		isParentOf(subInterface: Self.Interface): void;

		private _sanitizeDefinition(definition: object): void;

		private _isPublicMethod(methodName: string): boolean;

		private _validateDefinition(definition: object): void;

		private _validateParentInterfaces(name: string, interfaces: globalThis.Array<Self.Interface>): void;

		private _validatePublicMethods(name: string, methods: object): void;

		static create(definition: Self.Interface.Options): Self.Interface;

	}

	export namespace Interface {
		interface Options {
			methods?: object;

			properties?: object;

			parentInterfaces?: globalThis.Array<number>;

			name?: string;

		}

	}

	class InterfaceMarker {
	}

	namespace InterfaceMarker {
	}

	export namespace JSX {
		export import Element = Self.VDomElement;

	}

	export function JsxRoute(props?: {children?: Self.VDom.Children; path?: string; content?: Self.Router.RouteContentCallback; exact?: boolean}): Self.JSX.Element;

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

	export class KeyHandler {
		add(keyStroke: (Self.KeyStroke.Source | Self.KeyShortcut), action: Self.KeyShortcut.ActionCallback): object;

		remove(shortcut: Self.KeyShortcut): void;

		handle(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): boolean;

	}

	export namespace KeyHandler {
	}

	export class KeyShortcut {
		constructor(options: {keyStroke: Self.KeyStroke; action: Self.KeyShortcut.ActionCallback});

		keyStroke: Self.KeyStroke;

		action: Self.KeyShortcut.ActionCallback;

		handle(message: Self.KeyboardMessage, result: Self.RoutedMessage.Result): boolean;

		match(message: Self.KeyboardMessage): boolean;

		static create(keyStroke: Self.KeyStroke.Source, action: Self.KeyShortcut.ActionCallback): Self.KeyShortcut;

	}

	export namespace KeyShortcut {
		type ActionCallback = (message: Self.KeyboardMessage, result: Self.RoutedMessage.Result) => boolean;

	}

	export class KeyStroke {
		constructor(options?: Self.KeyStroke.Options);

		keyCode: Self.KeyCode;

		key: string;

		modifier: Self.KeyboardMessage.Modifier;

		hash: Self.KeyStrokeHash;

		match(message: Self.KeyboardMessage): void;

		toString(): string;

		static fromString(str: string, options?: Self.KeyStroke.Options): Self.KeyStroke;

		static fromKeys(keys: globalThis.Array<(string | Self.KeyCode)>, options?: Self.KeyStroke.Options): Self.KeyStroke;

		static create(options: Self.KeyStroke.Source): Self.KeyStroke;

	}

	export namespace KeyStroke {
		interface Options {
			keyCode?: Self.KeyCode;

			key?: string;

			modifier: Self.KeyboardMessage.Modifier;

		}

		type Source = (Self.KeyStroke | Self.KeyStroke.Options | string | globalThis.Array<(string | Self.KeyCode)>);

	}

	export class KeyStrokeHash {
		constructor(options: {keyCode: Self.KeyCode; key: string; modifier: Self.KeyboardMessage.Modifier});

		match(hash: Self.KeyStrokeHash): boolean;

	}

	export namespace KeyStrokeHash {
	}

	export class KeyboardMessage extends Self.RoutedMessage {
		constructor(options: Self.KeyboardMessage.Options);

		element: Element;

		char: string;

		key: string;

		keyCode: number;

		charCode: number;

		modifier: Self.KeyboardMessage.Modifier;

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

	export class LazyDataSource<T = any> implements Self.DataSource<T>, Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(provider: Self.LazyDataSource.Provider<T>);

		dataSource: (Self.DataSource<T> | null);

		loaded: boolean;

		query(args: Self.DataSource.QueryArguments<T>, onResult: (args: {items: globalThis.Array<T>}) => void, onError?: (error: any) => void): void;

		transform<O = any>(transform: (item: T) => O): Self.LazyDataSource<O>;

		filter(predicate: (item: T) => boolean): Self.LazyDataSource<T>;

		map<O = any>(transform: (item: T, index: number) => O): Self.LazyDataSource<O>;

		sort(comparator: (left: T, right: T) => number): Self.LazyDataSource<T>;

		load(): globalThis.Promise<Self.DataSource<T>>;

	}

	export namespace LazyDataSource {
		type Provider<T = any> = () => (globalThis.Array<T> | Self.DataSource<T> | globalThis.Promise<(globalThis.Array<T> | Self.DataSource<T>)>);

	}

	export namespace Log {
		function log(level: Self.LogLevel, ...message: globalThis.Array<any>): void;

		function error(...args: globalThis.Array<any>): void;

		function warning(...args: globalThis.Array<any>): void;

		function warningOnce(message: string): void;

		function info(...args: globalThis.Array<any>): void;

		function debug(...args: globalThis.Array<any>): void;

		function trace(...args: globalThis.Array<any>): void;

		function deprecation(message: string, version: Self.ReleaseVersion, link?: string): void;

	}

	export enum LogCategory {
		GLOBAL,
		DEPRECATION,
	}

	export class LogFormatter implements Self.NotificationFormatter {
		constructor();

		showTime: boolean;

		showLevel: boolean;

		showStack: boolean;

		showUrl: boolean;

		format(notification: object): globalThis.Array<any>;

		static stringifyValue(obj: any): string;

		static timeToLocaleString(time: Self.Date): string;

		static getLevelString(level: Self.LogLevel): string;

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

	export class LogReporter implements Self.EventBusListener {
		constructor();

		threshold: Self.LogLevel;

		captureStackTrace: boolean;

		process(notification: {category: Self.LogCategory; level: Self.LogLevel; message: string; time: Self.Date}): void;

		setFormatter(formatter: Self.NotificationFormatter): void;

		protected _preprocess(): object;

	}

	export namespace LogReporter {
	}

	export class LoggingContext {
		constructor(options?: {reporters?: object});

		attach(): void;

		detach(): void;

		log(level: Self.LogLevel, ...message: globalThis.Array<any>): void;

		getReporter(reporter: string): any;

		static default(debug: object, extraReporters?: object): Self.LoggingContext;

		static console(): Self.LoggingContext;

		static none(): Self.LoggingContext;

	}

	export namespace LoggingContext {
	}

	export class LruCache {
		constructor(maxSize?: number);

		size: number;

		has(key: any): boolean;

		peek(key: any): any;

		get(key: any): any;

		set(key: any, value: any): Self.LruCache;

		delete(key: any): Self.LruCache;

		clear(): Self.LruCache;

		private _removeLast(): void;

	}

	export namespace LruCache {
	}

	/**
	 * @deprecated Use the native Map
	 */
	export class Map {
		constructor(iterable?: globalThis.Array<any>);

		[Symbol.iterator](): any;

		size: number;

		empty: boolean;

		firstKey: any;

		keys: globalThis.Array<any>;

		values: globalThis.Array<any>;

		entries: globalThis.Array<any>;

		set(key: any, value: any): globalThis.Map<any, any>;

		get(key: any): any;

		delete(key: any): globalThis.Map<any, any>;

		has(key: any): boolean;

		clear(): globalThis.Map<any, any>;

		forEach(callback: (value: any, key: any, map: globalThis.Map<any, any>) => void, context?: any): void;

		static fromArray(array: globalThis.Array<any>, splitter?: (item: any) => ({key: string; value: any} | null)): globalThis.Map<any, any>;

	}

	export namespace Map {
	}

	export class MarkdownService {
		constructor(options?: Self.MarkdownService.Options);

		setCreateLink(createLinkFactory: (args: object) => Self.JSX.Element): void;

		setCreateText(createTextFactory: (args: object) => Self.JSX.Element): void;

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

	export interface MessageHandler {
		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

	}

	export namespace MessageHandler {
	}

	export class Mixin extends Self.MixinMarker {
		constructor(definition: Self.Mixin.Options);

		static create(definition: object): Self.Mixin;

	}

	export namespace Mixin {
		interface Options {
			methods?: object;

			properties?: object;

			name?: string;

		}

	}

	class MixinMarker {
	}

	namespace MixinMarker {
	}

	export enum MouseButton {
		LEFT,
		MIDDLE,
		RIGHT,
	}

	export interface MutableDataSource<T = any> extends Self.DataSource<T> {
		add(args: {parent?: T; item?: T; items?: globalThis.Array<T>; index?: number; reason?: string}): Self.MutableDataSource.AddResult<T>;

		remove(args: {parent?: T; item?: T; items?: globalThis.Array<T>; index?: number; count?: number; reason?: string}): Self.MutableDataSource.RemoveResult<T>;

		move(args: {sourceParent?: T; sourceIndex: number; targetParent?: T; targetIndex: number; count?: number; reason?: string}): Self.MutableDataSource.MoveResult<T>;

	}

	export namespace MutableDataSource {
		interface AddResult<T> {
			parent?: T;

			index: number;

			items: globalThis.Array<T>;

			reason?: string;

		}

		interface RemoveResult<T> {
			parent?: T;

			index: number;

			count: number;

			items: globalThis.Array<T>;

			reason?: string;

		}

		interface MoveResult<T> {
			sourceParent?: T;

			sourceIndex: number;

			targetParent?: T;

			targetIndex: number;

			count: number;

			items: globalThis.Array<T>;

			reason?: string;

		}

	}

	export class Navigator {
		constructor(options: {getLocation: () => Self.Navigator.GetLocationResult; constructUrl: (route: string, params: object) => string});

		location: string;

		search: string;

		hash: string;

		constructUrl(route: string, params?: object): string;

		recognizeRoute(route: string, options?: {exact?: boolean}): object;

		listen(callback: (args: {location: string; search: string; hash: string}) => void): () => void;

		push(route: string, params?: object): void;

		replace(route: string, params: object): void;

		go(index: number): void;

		back(): void;

		forward(): void;

		static path(options?: {basename?: string}): Self.Navigator;

		static hash(): Self.Navigator;

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
		constructor();

	}

	export namespace NoneLogFormatter {
	}

	export interface NotificationFormatter {
		format(notification: object): globalThis.Array<any>;

	}

	export namespace NotificationFormatter {
	}

	export const NotificationService: Self.EventBus;

	export namespace Number {
		function isBetween(number: number, rangeStart: number, rangeEnd: number): boolean;

		function isValidIndex(index: number, size: number): boolean;

		function isFinite(value: any): boolean;

		function isNaN(value: any): boolean;

		function isInfinity(value: any): boolean;

		function toBounds(number: number, min: number, max: number): number;

		function lerp(a: number, b: number, t: number): number;

		function inverseLerp(value: number, a: number, b: number): number;

		function randomInteger(min: number, max: number): number;

		function randomIndex(length: number): number;

		function compare(left: number, right: number, ascending?: boolean): number;

		function isPowerOf2(number: number): boolean;

		function of(value: any): number;

		function isInteger(value: any): boolean;

		function parse(value: string): number;

	}

	export namespace Object {
		function extend(target: object, ...sources: globalThis.Array<object>): object;

		function deepExtend(target: object, ...sources: globalThis.Array<object>): object;

		function copy(source: (object | globalThis.Array<any>)): object;

		function copyWithSymbols(source: object): void;

		function copyIf(source: (object | globalThis.Array<any>), predicate: (key: string, value: any) => boolean): object;

		function deepCopy(source: object, maxLevel?: number): void;

		function filter(source: object, filter: (key: string, value: any) => boolean): object;

		function deepContains(left: any, right: any): boolean;

		function equals(left: any, right: any): boolean;

		function shallowEquals(left: (object | null), right: (object | null)): boolean;

		function isEmpty(object: object): boolean;

		function guid(object: object): number;

		function nextGuid(): number;

		function defineProperty(): void;

		function defineProperties(): void;

		function freeze(object: object): object;

		function deepFreeze(object: object): object;

		function isFrozen(object: object): boolean;

		function getOwnPropertyNames(): void;

		function getOwnPropertyDescriptor(): void;

		function getOwnPropertyDescriptors(): void;

		function getOwnPropertySymbols(): void;

		function keys(object: object): globalThis.Array<string>;

		function keysWithSymbols(source: object): globalThis.Array<(string | symbol)>;

		function assign(...object: globalThis.Array<object>): object;

		function getPrototypeOf(object: object): (object | null);

		function getPropertyDescriptor(object: object, propertyName: string): (object | null);

		function values(object: object): globalThis.Array<any>;

		function entries(object: object): globalThis.Array<[string, any]>;

		function entriesWithSymbols(source: object): globalThis.Array<[(string | symbol), any]>;

		function fromEntries(iterable: Iterable<[string, any]>): object;

		function create(prototype: object, properties?: object): object;

		function is(left: any, right: any): boolean;

		function toString(value: any): string;

		function getValue(context: object, path: (string | globalThis.Array<string>), defaultValue?: any): any;

		function setValue(context: object, path: (string | globalThis.Array<string>), value: any, pathCreator?: (context: object, property: string) => object): void;

		function compareValues(left: object, right: object, path: (string | globalThis.Array<string>), comparator?: (left: any, right: any) => boolean): boolean;

		function mapValues(input: object, mapper: (value: any, key: string, input: object) => any): void;

		function symbolKeys(object: object): globalThis.Array<symbol>;

		function symbolValues(object: object): globalThis.Array<any>;

		function symbolEntries(object: object): globalThis.Array<[symbol, any]>;

		function hasOwnProperty(object: object, propertyName: string): boolean;

		const EMPTY: object;

	}

	class OpaqueFocusHandler {
		constructor(args: {component?: Self.Component; handler?: Self.FocusHandler});

		effectiveFocusable: boolean;

		focusable: boolean;

		effectiveTabbable: boolean;

		tabbable: boolean;

		focusComponent: Self.Component;

		update(): void;

		focus(): any;

		isFocused(focusComponent: Self.Component): boolean;

		static wrap(parent: Self.Component, child: Self.Component): Self.OpaqueFocusHandler;

	}

	namespace OpaqueFocusHandler {
	}

	export class Page {
		constructor(options?: Self.Page.Options);

		context: Self.Context;

		shell: PackageComponent.Shell;

		services: Self.HierarchicalMap;

		supportedThemes: (globalThis.Array<Self.Theme.Name> | null);

		run(): void;

	}

	export namespace Page {
		interface Options {
			context?: Self.Context;

			shell?: PackageComponent.Shell;

		}

	}

	export class PageMessageDispatcher {
		constructor(options: object);

		registerFilter(handler: (Self.RoutedMessage.Filter | Self.MessageHandler)): {remove: () => void};

		attach(eventDispatcher?: HTMLElement): {remove: () => void};

		detach(eventDispatcher: HTMLElement): void;

		dispose(): void;

		postMessage(message: Self.RoutedMessage): void;

		private createMessageRoute(message: Self.RoutedMessage): globalThis.Array<Self.RoutedMessage.Filter>;

		protected getMessageHandlers(message: Self.RoutedMessage): globalThis.Array<Self.MessageHandler>;

		private hookOnEventDispatcher(): void;

		private unhookFromEventDispatcher(): void;

		static addElementMessageFilter(element: Element, filter: Self.RoutedMessage.Filter): {remove: ((() => void))};

		static HandledEvents: globalThis.Array<string>;

	}

	export namespace PageMessageDispatcher {
	}

	export function ParamRouter(props: {name: string; children?: Self.VDom.Children}): Self.JSX.Element;

	export function PathRouter(props?: {basename?: string; children?: Self.VDom.Children}): Self.JSX.Element;

	export class PersistingFormatter extends Self.LogFormatter {
		constructor();

	}

	export namespace PersistingFormatter {
	}

	export class PersistingReporter extends Self.LogReporter {
		constructor();

		getMessages(): globalThis.Array<any>;

		getDeprecations(): globalThis.Array<any>;

		hasDeprecations(): boolean;

		clear(): void;

		static getMessages(): globalThis.Array<any>;

		static Event: Self.PersistingReporter.EventTypes;

	}

	export namespace PersistingReporter {
		interface EventTypes {
			STORAGE_CHANGED: string;

		}

	}

	export class PointerMessage extends Self.RoutedMessage {
		constructor(options: Self.PointerMessage.Options);

		element: Element;

		relatedElement: Element;

		button: Self.PointerMessage.Button;

		modifier: Self.KeyboardMessage.Modifier;

		position: Self.PointerMessage.Position;

		wheel: Self.PointerMessage.Wheel;

		movement: Self.PointerMessage.Movement;

		pointerId: string;

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
		owner: (Self.Component | Self.VDomRef | Element | null);

	}

	namespace Portal {
	}

	export class PositionHelper {
		static getPosition(options: Self.PositionHelper.Options): Self.PositionHelper.FrameDescription;

		private static _choosePosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		private static _chooseScreenPosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		private static _chooseTargetPosition(options: Self.PositionHelper.HelperOptions): Self.PositionHelper.FrameDescription;

		private static _useStrategy(basePointPosition: Self.PositionHelper.Point, frameDescription: Self.PositionHelper.FrameDescription, result: Self.PositionHelper.BestResult, options: Self.PositionHelper.HelperOptions): void;

		private static _shiftFrame(frameDescription: Self.PositionHelper.FrameDescription, outerFrame: Self.PositionHelper.Coordinates): void;

		private static _getAvailableAlignments(placement: string, options: Self.PositionHelper.HelperOptions): globalThis.Array<Self.PositionHelper.Alignment>;

		private static _getBasePointCoordinates(elementBox: Self.PositionHelper.Coordinates, position: {placement: Self.PositionHelper.Placement; alignment: Self.PositionHelper.Alignment}, userOffset: Self.PositionHelper.Offset): Self.PositionHelper.Point;

		private static _getFramePosition(size: Self.PositionHelper.Size, basePosition: Self.PositionHelper.Point, place: {placement: Self.PositionHelper.Placement; alignment: Self.PositionHelper.Alignment}): Self.Rectangle;

		private static _reduceSize(visibleFrame: Self.PositionHelper.Coordinates, size: Self.PositionHelper.Size, frameDescription: Self.PositionHelper.FrameDescription, centerPoint: Self.PositionHelper.Point): Self.PositionHelper.Size;

		private static _concatAllowedPositions(options: Self.PositionHelper.HelperOptions): globalThis.Array<Self.PositionHelper.Placement>;

		static getOuterFramePosition(frame: (HTMLElement | PackageComponent.Window)): Self.Rectangle;

		private static _initializeOptions(options: Self.PositionHelper.Options): Self.PositionHelper.HelperOptions;

		private static _getBox(target: (Self.Rectangle | Element | object)): Self.Rectangle;

		private static _initializeSizes(options: object): Self.PositionHelper.SizeOptions;

		static DEFAULT_PLACEMENT: globalThis.Array<Self.PositionHelper.Placement>;

		static DEFAULT_ALIGNMENT: globalThis.Array<Self.PositionHelper.Alignment>;

		static DEFAULT_SIZE: Self.PositionHelper.SizeOptions;

	}

	export namespace PositionHelper {
		interface Coordinates extends Self.Rectangle {
		}

		interface SizeOptions {
			height?: number;

			minHeight?: number;

			maxHeight?: number;

			width?: number;

			minWidth?: number;

			maxWidth?: number;

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

			target?: (string | HTMLElement | Self.PositionHelper.Point | Self.Rectangle | Self.PositionHelper.TargetPoint);

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

		interface TargetPoint {
			left: number;

			top: number;

			element: Element;

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

		enum Strategy {
			SIZE,
			POSITION,
			SHIFT,
		}

		enum Placement {
			OVER,
			ALL,
			ABOVE,
			BELOW,
			LEFT,
			RIGHT,
		}

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

		enum ScreenPosition {
			SCREEN_CENTER,
		}

	}

	export class Preferences {
		constructor(options?: {preferences?: object});

		get(preference: string, defaultValue?: any): any;

		set(key: string, value: any): Self.Preferences;

		has(preference: string): boolean;

		addBundle(preferences: object): Self.Preferences;

	}

	export namespace Preferences {
	}

	export class Presenter implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options: Self.Presenter.Options);

		context: Self.Context;

		view: Self.Component;

		viewCreated: boolean;

		services: Self.HierarchicalMap;

		state: Self.HierarchicalMap;

		routeState: Self.Route.State;

		i18n: Self.I18n;

		initialized: boolean;

		disposed: boolean;

		initialize(): void;

		createView(): Self.Component;

		publish(topic: string, args?: object, options?: {mode?: Self.Context.EventMode}): void;

		subscribe(topic: string, handler: (args: object) => void): {remove: () => void};

		dispatchAction(action: (Self.Reducer.Action | string), payload?: any): void;

		routeTo(route: Self.Route, parameters?: object, modifiers?: object): void;

		dispose(): void;

		translate(value: (string | number | Self.Translation)): string;

		private _createView(): Self.Component;

		protected _createChild(presenterClass: any, options?: {contextName?: string; contextNameSuffix?: string; stateProvider?: Self.Context.StateProviderCallback; state?: object; eventRoot?: boolean; contextOptions?: object; presenterOptions?: object}): Self.Presenter;

		protected _onRegisterServices(servicesContainer: Self.HierarchicalMap, rootServicesContainer: Self.HierarchicalMap): void;

		protected _onRegisterListeners(): void;

		protected _onStateChanged(oldState: object, currentState: object): void;

		protected _onRouteChanged(oldRouteState: Self.Route.State, currentRouteState: Self.Route.State): void;

		protected _onCreateView(): Self.Component;

		protected _onViewCreated(): void;

		protected _onDispose(): void;

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

	export class PriorityQueue {
		constructor();

		length: number;

		empty: boolean;

		insert(item: any, priority: number): void;

		pop(): any;

	}

	export namespace PriorityQueue {
	}

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

	export class PropertyObservableProxy {
		constructor();

		static wrap(value: object): Self.PropertyObservableProxy;

	}

	export namespace PropertyObservableProxy {
	}

	export class PureComponent<Props = any, State = any> {
		constructor(props: Props, context: any);

		setState(state: Partial<State>): void;

		protected props: Props;

		protected state: State;

		protected context: any;

		protected style: any;

		protected render(): Self.VDom.Node;

		/**
		 * @deprecated
		 */
		protected mounted(): void;

		protected componentDidMount(): void;

		/**
		 * @deprecated
		 */
		protected willUnmount(): void;

		protected componentWillUnmount(): void;

		/**
		 * @deprecated
		 */
		protected updated(previousProps: Props, previousState: State, previousContext: any, snapshot: any): void;

		protected componentDidUpdate(previousProps: Props, previousState: State, previousContext: any, snapshot: any): void;

		/**
		 * @deprecated
		 */
		protected shouldUpdate(nextProps: Props, nextState: State, nextContext: any): void;

		protected shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): void;

		protected getSnapshotBeforeUpdate(previousProps: Props, previousState: State, previousContext: any): any;

	}

	export namespace PureComponent {
	}

	export namespace RecordIcon {
		const ACTIVITY: Self.ImageMetadata;

		const CALL: Self.ImageMetadata;

		const CAMPAIGN: Self.ImageMetadata;

		const CASE: Self.ImageMetadata;

		const CASH_REFUND: Self.ImageMetadata;

		const CONTACT: Self.ImageMetadata;

		const CREDIT_CARD: Self.ImageMetadata;

		const CUSTOMER: Self.ImageMetadata;

		const DATASET: Self.ImageMetadata;

		const EMAIL: Self.ImageMetadata;

		const EMPLOYEE: Self.ImageMetadata;

		const ESTIMATE: Self.ImageMetadata;

		const EVENT: Self.ImageMetadata;

		const EXPENSE_REPORT: Self.ImageMetadata;

		const FILE: Self.ImageMetadata;

		const INFORMATION_ITEM: Self.ImageMetadata;

		const INVOICE: Self.ImageMetadata;

		const ISSUE: Self.ImageMetadata;

		const ITEM: Self.ImageMetadata;

		const JOURNAL: Self.ImageMetadata;

		const LEAD: Self.ImageMetadata;

		const LETTER: Self.ImageMetadata;

		const NOTE: Self.ImageMetadata;

		const OPPORTUNITY: Self.ImageMetadata;

		const PARTNER: Self.ImageMetadata;

		const PARTNER_SCHEDULE: Self.ImageMetadata;

		const PAYCHECK: Self.ImageMetadata;

		const PAYROLL_BATCH: Self.ImageMetadata;

		const PDF: Self.ImageMetadata;

		const PROJECT: Self.ImageMetadata;

		const PROSPECT: Self.ImageMetadata;

		const PURCHASE_ORDER: Self.ImageMetadata;

		const RETURN_AUTHORIZATION: Self.ImageMetadata;

		const SALES_ORDER: Self.ImageMetadata;

		const SOLUTION: Self.ImageMetadata;

		const TASK: Self.ImageMetadata;

		const TIME_OFF_REQUEST: Self.ImageMetadata;

		const TOPIC: Self.ImageMetadata;

		const TRANSACTION: Self.ImageMetadata;

		const TRANSFER: Self.ImageMetadata;

		const WEEKLY_TIME: Self.ImageMetadata;

		const WORKBOOK: Self.ImageMetadata;

		const WORK_ORDER: Self.ImageMetadata;

	}

	export class Rectangle {
		constructor(rectangle: Self.Rectangle.RectangleSpec);

		right: number;

		bottom: number;

		x: number;

		y: number;

		intersect(rectangle: Self.Rectangle): Self.Rectangle;

		intersects(rectangle: Self.Rectangle): boolean;

		intersectArea(rectangle: Self.Rectangle): number;

		union(rectangle: Self.Rectangle): Self.Rectangle;

		contains(rectangle: Self.Rectangle): boolean;

		equals(rectangle: Self.Rectangle): boolean;

		clipSize(rectangle: Self.Rectangle): Self.Rectangle;

		area(): number;

		extend(delta: (number | Self.Rectangle)): Self.Rectangle;

		moveInto(rectangle: Self.Rectangle): Self.Rectangle;

		clone(): Self.Rectangle;

		round(): Self.Rectangle;

		getEnclosingIntRectangle(): Self.Rectangle;

		getSnappedIntRectangle(): Self.Rectangle;

		static getBoundingRectangle(): Self.Rectangle;

		static fromBox(rectangle: Self.Rectangle): Self.Rectangle;

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
		type Function = (currentState: any, action: Self.Reducer.Action) => any;

		interface Action {
			type: (string | symbol);

			payload?: any;

		}

		interface WithPath {
			reduce: Self.Reducer.Function;

			path: (string | globalThis.Array<string>);

		}

		function create(options: {name?: string; initialState?: object; Action?: object; before?: (Self.Reducer.Function | Self.Reducer.WithPath | globalThis.Array<(Self.Reducer.WithPath | Self.Reducer.Function)>); after?: (Self.Reducer.Function | Self.Reducer.WithPath | globalThis.Array<(Self.Reducer.WithPath | Self.Reducer.Function)>)}): any;

		function combine(reducers: globalThis.Array<Self.Reducer.WithPath>): Self.Reducer.Function;

	}

	export enum RedwoodColorSet {
	}

	export enum RedwoodDensity {
		STANDARD,
		COMPACT,
	}

	enum RedwoodIcon {
		AI_SPARKLE,
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
		ICO_BOOK,
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
		ICO_CHEVRON_UP_DOWN,
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
		ICO_DOWN_PARENT,
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
		ICO_ERROR_S,
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
		ICO_GRID_VIEW_LARGE,
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
		ICO_INFORMATION_S,
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
		ICO_ORACLE_CHAT_OUTLINE,
		ICO_OVERFLOW_H,
		ICO_OVERFLOW_VERT,
		ICO_PAGINATION,
		ICO_PARTNERS,
		ICO_PAUSE,
		ICO_PIN,
		ICO_PIN_COLUMNS,
		ICO_PIN_ROWS,
		ICO_PLAY,
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
		ICO_STOP,
		ICO_STOPWATCH,
		ICO_SUBDIRECTORY_ARROW_UP_RIGHT,
		ICO_SUBSIDIARY,
		ICO_SUCCESS,
		ICO_SUCCESS_S,
		ICO_SWITCH_OFF,
		ICO_SWITCH_ON,
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
		ICO_UNDO,
		ICO_UNDO_ALT,
		ICO_UNGROUP,
		ICO_UNHAPPY_FILLED,
		ICO_UNLINK,
		ICO_UPLOAD,
		ICO_UP_PARENT,
		ICO_VERYHAPPY_FILLED,
		ICO_VERYUNHAPPY_FILLED,
		ICO_VIEW,
		ICO_VIEW_HIDE,
		ICO_VIEW_PARTIAL,
		ICO_WARNING,
		ICO_WARNING_S,
		ICO_WRAP_LINE,
		ICO_WRENCH,
		ICO_ZOOM_IN,
		ICO_ZOOM_OUT,
	}

	enum RedwoodRecordIcon {
		ACTIVITY,
		CALL,
		CAMPAIGN,
		CASE,
		CASH_REFUND,
		CONTACT,
		CREDIT_CARD,
		CUSTOMER,
		DATASET,
		EMAIL,
		EMPLOYEE,
		ESTIMATE,
		EVENT,
		EXPENSE_REPORT,
		FILE,
		INFORMATION_ITEM,
		INVOICE,
		ISSUE,
		ITEM,
		JOURNAL,
		LEAD,
		LETTER,
		NOTE,
		OPPORTUNITY,
		PARTNER,
		PARTNER_SCHEDULE,
		PAYCHECK,
		PAYROLL_BATCH,
		PDF,
		PROJECT,
		PROSPECT,
		PURCHASE_ORDER,
		RETURN_AUTHORIZATION,
		SALES_ORDER,
		SOLUTION,
		TASK,
		TIME_OFF_REQUEST,
		TOPIC,
		TRANSACTION,
		TRANSFER,
		WEEKLY_TIME,
		WORKBOOK,
		WORK_ORDER,
	}

	export enum RedwoodScale {
		SM,
		MD,
		LG,
		NETSUITE,
	}

	enum RedwoodSystemIconMapping {
	}

	export class RedwoodTheme extends Self.Theme {
		constructor(options?: Self.RedwoodTheme.Options);

		scale: Self.RedwoodTheme.Scale;

		scaleNS: boolean;

		scaleSM: boolean;

		scaleMD: boolean;

		scaleLG: boolean;

		density: Self.RedwoodTheme.Density;

		densityStandard: boolean;

		densityCompact: boolean;

		colorSet: Self.RedwoodTheme.ColorSet;

		rootSize: number;

		getScaleStyle(scale: Self.RedwoodScale, styles: Record<(Self.RedwoodScale | string), Self.Style>): Self.Style;

		static forColorSet(colorSet: Self.RedwoodTheme.ColorSet): Self.RedwoodTheme;

		static colorSets: globalThis.Array<number>;

	}

	export namespace RedwoodTheme {
		interface Options extends Self.Theme.Options {
			scale?: Self.RedwoodTheme.Scale;

			density?: Self.RedwoodTheme.Density;

			colorSet?: Self.RedwoodTheme.ColorSet;

		}

		interface ColorSetDefinition {
			primary: string;

		}

		export import Icon = Self.RedwoodIcon;

		export import RecordIcon = Self.RedwoodRecordIcon;

		export import SystemIconMapping = Self.RedwoodSystemIconMapping;

		export import Scale = Self.RedwoodScale;

		export import Density = Self.RedwoodDensity;

		export import ColorSet = Self.RedwoodColorSet;

	}

	class ReflectionClassDescriptor {
	}

	namespace ReflectionClassDescriptor {
	}

	export enum RefreshedColorSet {
	}

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
		CARD_VIEW,
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
		CHEVRON_UP_DOWN,
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
		LOG_OUT,
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
		PAUSE,
		PAYABLES,
		PERFORMANCE,
		PERSON,
		PIN,
		PIN_COLUMNS,
		PIN_ROWS,
		PIVOT_TABLE,
		PLAY,
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
		STATUS_ERROR,
		STATUS_ERROR_FILLED,
		STATUS_INFO,
		STATUS_INFO_FILLED,
		STATUS_SUCCESS,
		STATUS_SUCCESS_FILLED,
		STATUS_WARNING,
		STATUS_WARNING_FILLED,
		STOP,
		SUBSIDIARIES,
		SUM,
		SUMMARIZE,
		SWITCH,
		SWITCH_OFF,
		SWITCH_ON,
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
		WORKBOOK,
		WRAP_LINE,
		XAXIS,
		YAXIS,
		ZOOM_FIT,
		ZOOM_IN,
		ZOOM_OUT,
	}

	enum RefreshedRecordIcon {
		ACTIVITY,
		CALL,
		CAMPAIGN,
		CASE,
		CASH_REFUND,
		CONTACT,
		CREDIT_CARD,
		CUSTOMER,
		DATASET,
		EMAIL,
		EMPLOYEE,
		ESTIMATE,
		EVENT,
		EXPENSE_REPORT,
		FILE,
		INFORMATION_ITEM,
		INVOICE,
		ISSUE,
		ITEM,
		JOURNAL,
		LEAD,
		LETTER,
		NOTE,
		OPPORTUNITY,
		PARTNER,
		PARTNER_SCHEDULE,
		PAYCHECK,
		PAYROLL_BATCH,
		PDF,
		PROJECT,
		PROSPECT,
		PURCHASE_ORDER,
		RETURN_AUTHORIZATION,
		SALES_ORDER,
		SOLUTION,
		TASK,
		TIME_OFF_REQUEST,
		TOPIC,
		TRANSACTION,
		TRANSFER,
		WEEKLY_TIME,
		WORKBOOK,
		WORK_ORDER,
	}

	export class RefreshedTheme extends Self.Theme {
		constructor(options?: Self.RefreshedTheme.Options);

		colorSet: Self.RefreshedTheme.ColorSet;

		static forColorSet(colorSet: Self.RefreshedTheme.ColorSet): Self.RefreshedTheme;

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

		export import RecordIcon = Self.RefreshedRecordIcon;

		export import ColorSet = Self.RefreshedColorSet;

	}

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
		R26_1,
		R26_2,
		R27_1,
		R27_2,
		current,
		incoming,
	}

	export namespace Require {
		function module(module: string): globalThis.Promise<any>;

		function modules(modules: globalThis.Array<string>): globalThis.Promise<any>;

	}

	export class ResizeObserver {
		constructor(callback: Self.ResizeObserver.ResizeCallback, options?: {box?: Self.ResizeObserver.Box});

		target: (Self.Component | Element | null);

		lastObservedSize: {width: number; height: number};

		connect(target: (Self.Component | Element)): void;

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
	 * @deprecated
	 */
	export class Route {
		constructor(options: Self.Route.Options);

		pattern: string;

		constructUrl(params?: object): string;

		recognizeUrl(url: string): (object | null);

		handle(args: Self.Route.HandlerArgs): void;

		withParameters(parameters: object): Self.Route.State;

		static create(url: string, handler?: Self.Route.Handler): Self.Route;

	}

	export namespace Route {
		interface Options {
			url?: string;

			handler: Self.Route.Handler;

		}

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

	export class RoutedMessage {
		constructor(options: Self.RoutedMessage.Options);

		code: Self.MessageCode;

		recipient: (Self.Component | null);

		static createFilter(filter: (Record<Self.RoutedMessage.FilterCode, Self.RoutedMessage.Handler> | Self.RoutedMessage.Filter)): Self.RoutedMessage.Filter;

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

	export class Router {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options: Self.Router.Options);

		routes: globalThis.Array<Self.Route>;

		context: (Self.Context | null);

		activeRoute: (Self.Route | null);

		activeParams: object;

		activeUrl: string;

		routeTo(route?: (Self.Route | string), params?: object, args?: {replace?: boolean}): void;

		redirectTo(route?: (Self.Route | string), params?: object): void;

		addRoute(route: Self.Route): void;

		removeRoute(route: Self.Route): boolean;

		listen(): void;

		stop(): void;

		goBack(): void;

		goForward(): void;

		static createRoute(url: string, handler?: Self.Route.Handler): Self.Route;

		static Event: Self.Router.EventTypes;

	}

	export namespace Router {
		interface Options {
			routes: (globalThis.Array<Self.Route> | object);

			context?: Self.Context;

			on?: Self.EventSource.ListenerMap;

		}

		type RouteContentCallback = (args: any) => (Self.JSX.Element | string | number | null);

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

	export class RouterLocation {
		constructor(options: Self.RouterLocation.Options);

		location: string;

		search: string;

		hash: string;

		matches(route: string, options?: {exact?: boolean}): boolean;

	}

	export namespace RouterLocation {
		interface Options {
			location: string;

			search: string;

			hash: string;

		}

	}

	export function Routes(props?: object): Self.JSX.Element;

	export class ScrollController implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options?: Self.ScrollController.Options);

		viewportSize: Self.Scrollable.Size;

		contentSize: Self.Scrollable.Size;

		scrollOffset: Self.Scrollable.Offset;

		scrollability: Self.Scrollable.Scrollability;

		scrollabilityOffset: Self.Scrollable.Scrollability;

		hasHorizontalScrollbar: boolean;

		hasVerticalScrollbar: boolean;

		canScroll(options: Self.ScrollController.ScrollOptions): boolean;

		scroll(options: Self.ScrollController.ScrollOptions): boolean;

		applyScrollOffsetFromElement(element: HTMLElement, options?: Self.ScrollController.ScrollOptions): boolean;

		scrollToTop(options?: {reason?: any}): boolean;

		scrollToBottom(options?: {reason?: any}): boolean;

		resize(options: Self.ScrollController.ResizeOptions): boolean;

		resizeFromElement(element: HTMLElement, options?: Self.ScrollController.ResizeOptions): void;

		bind(scrollable: Self.Scrollable, options: object): {remove: () => void};

		unbind(scrollable: Self.Scrollable): void;

		dispose(): void;

		static Event: Self.ScrollController.EventTypes;

	}

	export namespace ScrollController {
		interface EventTypes {
			SCROLL: string;

			RESIZE: string;

			SCROLLABILITY_CHANGED: string;

		}

		interface Options {
			viewportSize?: Self.Scrollable.Size;

			contentSize?: Self.Scrollable.Size;

			scrollOffset?: Self.Scrollable.Offset;

			on?: Self.EventSource.ListenerMap;

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

		enum ScrollBind {
			NoSync,
			HorizontalSync,
			VerticalSync,
		}

		enum SizeBind {
			NoSync,
			HorizontalSync,
			VerticalSync,
		}

		enum ScrollToMode {
			AUTO,
			START,
			END,
			CENTER,
		}

	}

	export class ScrollObserver implements Self.MessageHandler {
		constructor();

		processMessage(next: Self.RoutedMessage.Handler, message: Self.RoutedMessage, result: Self.RoutedMessage.Result): void;

		register(element: HTMLElement, handler: () => void): void;

		unregister(element: HTMLElement): void;

	}

	export namespace ScrollObserver {
	}

	export interface Scrollable {
		scrollOffset: Self.Scrollable.Offset;

		viewportSize: Self.Scrollable.Size;

		contentSize: Self.Scrollable.Size;

		resize(options: object): void;

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

	export class Set {
		constructor(iterable?: Iterable<any>);

		[Symbol.iterator](): any;

		size: number;

		empty: boolean;

		values: globalThis.Array<any>;

		add(value: any): globalThis.Set<any>;

		addAll(values: globalThis.Array<any>): globalThis.Set<any>;

		delete(value: any): globalThis.Set<any>;

		deleteAll(values: globalThis.Array<any>): globalThis.Set<any>;

		toggle(item: any, add?: boolean): globalThis.Set<any>;

		toggleAll(items: globalThis.Array<any>, add?: boolean): globalThis.Set<any>;

		has(value: any): boolean;

		hasAll(values: globalThis.Array<any>): boolean;

		hasAny(values: globalThis.Array<any>): boolean;

		clear(): globalThis.Set<any>;

		contains(set: globalThis.Set<any>): boolean;

		equals(set: globalThis.Set<any>): boolean;

		clone(): globalThis.Set<any>;

		union(set: globalThis.Set<any>): globalThis.Set<any>;

		unionInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		intersect(set: globalThis.Set<any>): globalThis.Set<any>;

		intersectInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		subtract(set: globalThis.Set<any>): globalThis.Set<any>;

		subtractInplace(set: globalThis.Set<any>): globalThis.Set<any>;

		forEach(callback: (value: any, set: globalThis.Set<any>) => void, context?: any): void;

		filter(predicate: (value: any) => boolean, context?: any): globalThis.Set<any>;

		filterInplace(predicate: (value: any) => boolean, context?: any): globalThis.Set<any>;

		map(transform: (value: any) => any, context?: any): globalThis.Set<any>;

		some(predicate: (value: any) => boolean, context?: any): boolean;

		every(predicate: (value: any) => boolean, context?: any): boolean;

		static fromValues(...values: globalThis.Array<any>): globalThis.Set<any>;

		static fromArray(array: globalThis.Array<object>): globalThis.Set<any>;

	}

	export namespace Set {
	}

	export class SimpleLogFormatter extends Self.LogFormatter {
		constructor();

	}

	export namespace SimpleLogFormatter {
	}

	export class SimplePerformance {
		constructor();

		data: Self.ArrayDataSource;

		addItem(name: string, value: any): void;

		begin(clazz: any, bucket: string): void;

		end(clazz: any, bucket: string): void;

	}

	export namespace SimplePerformance {
		enum Type {
			BEGIN,
			END,
		}

	}

	export namespace StackTrace {
		function get(): globalThis.Array<any>;

	}

	class StaticSizeIndex {
	}

	namespace StaticSizeIndex {
	}

	class Storage {
		constructor(options?: Self.Storage.Options);

		private _useStorage(): Self.Storage;

		private _isSessionStorageSupported(): boolean;

		private _isLocalStorageSupported(): boolean;

		private _setLastUpdate(key: string): void;

		private _cleanup(): void;

		private _getFinalKey(key: string): string;

		private _getItemExpiration(key: string): number;

		getItem(key: string): (string | object);

		setItem(key: string, value: (string | object), expireInDays?: number): void;

		touchItems(keys: (string | globalThis.Array<any>)): void;

		removeItem(key: string): void;

		static StorageSource: string;

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

	class StorageFallback {
		constructor();

		setItem(key: string, value: any): void;

		getItem(key: string): any;

		removeItem(key: string): void;

	}

	namespace StorageFallback {
	}

	export class Store<State = any> implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options?: Self.Store.Options);

		async: boolean;

		state: State;

		reducer: Self.Store.Reducer;

		setState(state: State, options?: {action?: Self.Store.Action}): void;

		getState(path?: globalThis.Array<string>): any;

		subscribe(callback: (state: State, sender: Self.Store) => void): () => void;

		dispatch(action: (Self.Store.Action | Self.Store.ActionCreator)): globalThis.Promise<State>;

		static create(options: (Self.Store.CreateOptions | Self.Store.Reducer), context?: Self.Context): Self.Store;

		static Provider(props: {store: Self.Store; children?: Self.VDom.Children}): Self.JSX.Element;

		static Event: Self.Store.EventTypes;

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

		type ActionCreator = (dispatch: Self.Store.DispatchFunc, getState: Self.Store.GetStateCallback) => globalThis.Promise<any>;

		type GetStateCallback = (path?: (string | globalThis.Array<string>)) => any;

		interface EventTypes {
			STATE_CHANGED: string;

		}

	}

	export namespace String {
		function contains(string: string, what: string, caseSensitive?: boolean): boolean;

		function compare(left: string, right: string, ascending?: boolean): number;

		function startsWith(string: string, prefix: string, caseSensitive?: boolean): boolean;

		function endsWith(string: string, suffix: string, caseSensitive?: boolean): boolean;

		function isEmpty(string: string): boolean;

		function insert(string: string, position: number, subString: string): void;

		function of(value: any): string;

		function padLeft(string: string, padCharacter: string, length: number): string;

		function padRight(string: string, padCharacter: string, length: number): string;

		function repeat(string: string, count: number): string;

		function capitalizeFirstLetter(string: string): string;

		function lowercaseFirstLetter(string: string): string;

		function camelCaseToKebabCase(string: string, separateNumbers?: boolean): string;

		function kebabCaseToCamelCase(string: string, capitalizeFirstLetter?: boolean): string;

		function snakeCaseToCamelCase(string: string, capitalizeFirstLetter?: boolean): string;

		function camelCaseToSnakeCase(string: string, separateNumbers?: boolean): string;

		const EMPTY: string;

	}

	export class Style {
		constructor(id: string, style: (string | null));

		toString(): string;

		static is(value: any): boolean;

		static empty(): Self.Style;

		static of(definition: TemplateStringsArray, ...parameters: globalThis.Array<string>): Self.Style;

		static keyframes(definition: TemplateStringsArray, ...parameters: globalThis.Array<string>): Self.Style;

		static fromObject(keyValueObject: object, keyParser?: (key: string) => string): Self.Style;

		static EMPTY: Self.Style;

	}

	export namespace Style {
	}

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

		const CARD_VIEW: Self.ImageMetadata;

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

		const CHEVRON_UP_DOWN: Self.ImageMetadata;

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

		const LOG_OUT: Self.ImageMetadata;

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

		const PAUSE: Self.ImageMetadata;

		const PAYABLES: Self.ImageMetadata;

		const PERFORMANCE: Self.ImageMetadata;

		const PERSON: Self.ImageMetadata;

		const PIN: Self.ImageMetadata;

		const PIN_COLUMNS: Self.ImageMetadata;

		const PIN_ROWS: Self.ImageMetadata;

		const PIVOT_TABLE: Self.ImageMetadata;

		const PLAY: Self.ImageMetadata;

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

		const STATUS_ERROR: Self.ImageMetadata;

		const STATUS_INFO: Self.ImageMetadata;

		const STATUS_SUCCESS_FILLED: Self.ImageMetadata;

		const STATUS_WARNING_FILLED: Self.ImageMetadata;

		const STATUS_ERROR_FILLED: Self.ImageMetadata;

		const STATUS_INFO_FILLED: Self.ImageMetadata;

		const STOP: Self.ImageMetadata;

		const SUBSIDIARIES: Self.ImageMetadata;

		const SUM: Self.ImageMetadata;

		const SUMMARIZE: Self.ImageMetadata;

		const SWITCH: Self.ImageMetadata;

		const SWITCH_ON: Self.ImageMetadata;

		const SWITCH_OFF: Self.ImageMetadata;

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

		const WORKBOOK: Self.ImageMetadata;

		const WRAP_LINE: Self.ImageMetadata;

		const XAXIS: Self.ImageMetadata;

		const YAXIS: Self.ImageMetadata;

		const ZOOM_FIT: Self.ImageMetadata;

		const ZOOM_IN: Self.ImageMetadata;

		const ZOOM_OUT: Self.ImageMetadata;

	}

	export class Theme {
		constructor(options: Self.Theme.Options);

		name: Self.Theme.Name;

		tokens: Record<string, any>;

		mixins: Record<string, Function>;

		rootStyle: Self.Style;

		dragAndDropStyle: Self.Style;

		cssVariablesStyle: Self.Style;

		isRefreshed: boolean;

		isRedwood: boolean;

		getComponentStyles(Component: (((...args: globalThis.Array<any>) => any) | object), provider?: (theme: Self.Theme) => object): object;

		getIcon(id: string): (Self.ImageMetadata | null);

		private generateCssVariablesStyle(): Self.Style;

		static select(preferredTheme: Self.Theme.Name, availableThemes: Record<Self.Theme.Name, Self.Theme>, supportedThemes: (globalThis.Array<Self.Theme.Name> | null)): Self.Theme.Name;

	}

	export namespace Theme {
		interface Options {
			name: Self.Theme.Name;

			rootStyle: Self.Style;

			tokens?: object;

			icons?: object;

			systemIconsMapping?: object;

		}

		enum Name {
			REFRESHED,
			REDWOOD,
		}

		enum Background {
			LIGHT,
			DARK,
		}

	}

	export function ThemeBackground(props: {value: Self.Theme.Background; children?: Self.VDom.Children}): Self.JSX.Element;

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
		CARD_VIEW,
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
		CHEVRON_UP_DOWN,
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
		LOG_OUT,
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
		PAUSE,
		PAYABLES,
		PERFORMANCE,
		PERSON,
		PIN,
		PIN_COLUMNS,
		PIN_ROWS,
		PIVOT_TABLE,
		PLAY,
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
		STATUS_ERROR,
		STATUS_INFO,
		STATUS_SUCCESS_FILLED,
		STATUS_WARNING_FILLED,
		STATUS_ERROR_FILLED,
		STATUS_INFO_FILLED,
		STOP,
		SUBSIDIARIES,
		SUM,
		SUMMARIZE,
		SWITCH,
		SWITCH_ON,
		SWITCH_OFF,
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
		WORKBOOK,
		WRAP_LINE,
		XAXIS,
		YAXIS,
		ZOOM_FIT,
		ZOOM_IN,
		ZOOM_OUT,
	}

	export namespace Thenable {
		function when(value?: any): globalThis.Promise<any>;

	}

	export class Time {
		constructor(options?: Self.Time.Options);

		hours: number;

		setHours(newValue: number): Self.Time;

		minutes: number;

		setMinutes(newValue: number): Self.Time;

		seconds: number;

		setSeconds(newValue: number): Self.Time;

		milliseconds: number;

		setMilliseconds(newValue: number): Self.Time;

		set(args: Self.Time.Options): Self.Time;

		addHours(hours: number): Self.Time;

		addMinutes(minutes: number): Self.Time;

		addSeconds(seconds: number): Self.Time;

		addMilliseconds(milliseconds: number): Self.Time;

		add(timeDiff: Self.Time.AddType): Self.Time;

		subtract(args: Self.Time.AddType): Self.Time;

		compareTo(time: Self.Time): number;

		equals(time: Self.Time): boolean;

		before(time: Self.Time): boolean;

		after(time: Self.Time): boolean;

		between(rangeStart: Self.Time, rangeEnd: Self.Time): boolean;

		toDate(date: Self.Date): Self.Date;

		static now(): Self.Time;

		static fromDate(date: Self.Date): Self.Time;

		static compare(left: Self.Time, right: Self.Time): number;

		static equals(left: (Self.Time | null), right: (Self.Time | null)): boolean;

		static startOfDay: Self.Time;

		static endOfDay: Self.Time;

	}

	export namespace Time {
		interface Options {
			hours?: number;

			minutes?: number;

			seconds?: number;

			milliseconds?: number;

		}

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

	export class Timer {
		constructor();

		scheduled: boolean;

		reschedule(callback: () => void, timeout?: number): void;

		schedule(callback: () => void, timeout?: number): void;

		scheduleAnimation(callback: () => void, timeout?: number): void;

		cancel(): void;

		startCounter(): void;

		getCounterElapsedTime(): (number | null);

		nullCounter(): void;

	}

	export namespace Timer {
	}

	class TransformedTranslation extends Self.Translation {
		constructor(original: Self.Translation, transform: (text: string, i18n: Self.I18n) => string);

	}

	namespace TransformedTranslation {
	}

	export class Translation {
		constructor(args: (string | Self.I18n.GetParam));

		translate(i18n: Self.I18n): string;

		transform(transform: (text: string, i18n: Self.I18n) => string): Self.TransformedTranslation;

		static of(args: (string | Self.I18n.GetParam)): Self.Translation;

		static computed(callback: (i18n: Self.I18n) => string): Self.Translation;

		static is(value: any): boolean;

	}

	export namespace Translation {
	}

	export class TreeDataSource<T = any> implements Self.MutableDataSource<T>, Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options: {data: globalThis.Array<any>; childAccessor?: (string | Self.TreeDataSource.ChildAccessorCallback<T>)});

		data: globalThis.Array<T>;

		length: number;

		query(args: Self.DataSource.QueryArguments, resolve: (args: {items: globalThis.Array<T>}) => void, reject?: (error: any) => void): void;

		setData(data: globalThis.Array<T>): void;

		itemAtIndexPath(indexPath: globalThis.Array<number>): T;

		add(args: {parent?: T; item?: T; items?: globalThis.Array<any>; index?: number; reason?: string}): Self.MutableDataSource.AddResult<T>;

		remove(args: {parent?: T; item?: T; items?: globalThis.Array<T>; index?: number; count?: number; reason?: string}): Self.MutableDataSource.RemoveResult<T>;

		clear(args?: {parent?: T}): void;

		move(args: {sourceParent?: T; sourceIndex: number; targetParent?: T; targetIndex: number; count?: number; reason?: string}): Self.MutableDataSource.MoveResult<T>;

		filter(filter: (item: T) => boolean): Self.GenericDataSource;

	}

	export namespace TreeDataSource {
		type ChildAccessorCallback<T = any> = (args: {dataItem: T}, resolve: (items: globalThis.Array<T>) => void, reject: (error: any) => void) => void;

	}

	export namespace Type {
		interface Matcher {
			is: (value: any) => boolean;

			name: (options: object) => string;

		}

		const Array: Self.Type.Matcher;

		const EmptyArray: Self.Type.Matcher;

		const NonEmptyArray: Self.Type.Matcher;

		const Function: Self.Type.Matcher;

		const String: Self.Type.Matcher;

		const EmptyString: Self.Type.Matcher;

		const NonEmptyString: Self.Type.Matcher;

		const Date: Self.Type.Matcher;

		const NativeDate: Self.Type.Matcher;

		const AnyDate: Self.Type.Matcher;

		const HTMLElement: Self.Type.Matcher;

		const Element: Self.Type.Matcher;

		const Error: Self.Type.Matcher;

		function StringPattern(regex: RegExp): Self.Type.Matcher;

		const Email: Self.Type.Matcher;

		const Number: Self.Type.Matcher;

		const NegativeNumber: Self.Type.Matcher;

		const NonNegativeNumber: Self.Type.Matcher;

		const PositiveNumber: Self.Type.Matcher;

		function BoundedNumber(min: number, max: number): Self.Type.Matcher;

		const Integer: Self.Type.Matcher;

		const NegativeInteger: Self.Type.Matcher;

		const NonNegativeInteger: Self.Type.Matcher;

		const PositiveInteger: Self.Type.Matcher;

		function BoundedInteger(min: number, max: number): Self.Type.Matcher;

		const Boolean: Self.Type.Matcher;

		const Object: Self.Type.Matcher;

		function InstanceOf(klass: Function): Self.Type.Matcher;

		function Implements(...interfaces: globalThis.Array<Self.Interface>): Self.Type.Matcher;

		const Primitive: Self.Type.Matcher;

		const PlainObject: Self.Type.Matcher;

		const Null: Self.Type.Matcher;

		const Undefined: Self.Type.Matcher;

		const Value: Self.Type.Matcher;

		const NoValue: Self.Type.Matcher;

		function Optional(type: Self.Type.Matcher): Self.Type.Matcher;

		function AnyOf(...types: globalThis.Array<Self.Type.Matcher>): Self.Type.Matcher;

		function NoneOf(...types: globalThis.Array<Self.Type.Matcher>): Self.Type.Matcher;

		function Enum(enumObject: object, enumName?: string): Self.Type.Matcher;

		function ArrayOf(type: Self.Type.Matcher): Self.Type.Matcher;

		function NonEmptyArrayOf(type: Self.Type.Matcher): Self.Type.Matcher;

		function PlainObjectOf(properties: object): Self.Type.Matcher;

		function ObjectOf(properties: object): Self.Type.Matcher;

		const Thenable: Self.Type.Matcher;

		const Iterable: Self.Type.Matcher;

		const Interface: Self.Type.Matcher;

		const Mixin: Self.Type.Matcher;

		const Symbol: Self.Type.Matcher;

	}

	export class Url {
		constructor(url: (null | string | Self.Url | Self.Url.Definition));

		base: string;

		params: globalThis.Map<any, any>;

		fragment: string;

		toString(): string;

		getParameter(name: string): (string | globalThis.Array<string>);

		addParameter(name: string, value: (string | globalThis.Array<string>)): Self.Url;

		removeParameter(name: string): Self.Url;

		getParameters(): globalThis.Map<any, any>;

		addParameters(parameters: (object | globalThis.Map<any, any>)): Self.Url;

		removeParameters(parameters: globalThis.Array<string>): Self.Url;

		getFragment(): string;

		setFragment(fragment: string): Self.Url;

		removeFragment(): Self.Url;

		getBase(): string;

		static addParameter(url: (null | string | Self.Url | Self.Url.Definition), parameter: string, value: string): string;

		static addParameters(url: (null | string | Self.Url | Self.Url.Definition), parameters: object): string;

		static removeParameter(url: (null | string | Self.Url | Self.Url.Definition), parameter: string): string;

		static removeParameters(url: (string | Self.Url), ...parameters: globalThis.Array<any>): string;

		static getParameters(url: string): globalThis.Map<any, any>;

		static getBase(url: string): string;

		static getFragment(url: string): string;

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

	class UserAgent {
		constructor(userAgent: string);

		private getDevice(userAgent: string): Self.UserAgent.Device;

		private getDeviceType(userAgent: string): Self.UserAgent.DeviceType;

		private getOS(userAgent: string): Self.UserAgent.OSType;

		device: Self.UserAgent.Device;

		deviceType: Self.UserAgent.DeviceType;

		osType: Self.UserAgent.OSType;

		static current(): Self.UserAgent;

	}

	namespace UserAgent {
		enum OSType {
			MACOS,
			IOS,
			ANDROID,
			WINDOWS,
			LINUX,
		}

		enum DeviceType {
			PHONE,
			TABLET,
			DESKTOP,
			UNKNOWN,
		}

		enum Device {
			IPHONE,
			IPAD,
			UNKNOWN,
		}

	}

	export class UserMessageHandle implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(message: Self.UserMessageService.MessageOptions);

		message: Self.UserMessageService.MessageOptions;

		shown: boolean;

		show(): void;

		hide(): void;

		toggle(show: boolean): void;

		static Event: Self.UserMessageHandle.EventTypes;

	}

	export namespace UserMessageHandle {
		interface EventTypes {
			SHOW: symbol;

			HIDE: symbol;

		}

	}

	export class UserMessageService implements Self.EventSource {
		on(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): Self.EventSource.Handle;

		off(eventName: (Self.EventSource.EventName | globalThis.Array<Self.EventSource.EventName> | Self.EventSource.ListenerMap), listener?: Self.EventSource.Listener): void;

		protected _fireEvent(eventName: Self.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: Self.EventSource.EventName, listener: Self.EventSource.Listener): Self.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: Self.EventSource.EventName): void;

		constructor(options: Self.UserMessageService.Options);

		handles: globalThis.Array<Self.UserMessageHandle>;

		show(message: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		clear(displayType: Self.UserMessageService.DisplayType): void;

		error(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		warning(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		info(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		success(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		neutral(args: Self.UserMessageService.MessageOptions): Self.UserMessageHandle;

		createChild(args: {displayTypes?: globalThis.Array<Self.UserMessageService.DisplayType>; bannerPanel?: PackageComponent.BannerPanel; growlPanel?: PackageComponent.GrowlPanel}): Self.UserMessageService;

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
			NEUTRAL,
		}

		enum DisplayType {
			BANNER,
			GROWL,
		}

	}

	export function VDom(type: (string | ((props?: object) => Self.VDomElement)), config?: object, children?: Self.VDom.Children): Self.VDomElement;

	export namespace VDom {
		type Node = (string | number | Self.VDomElement | Self.Component | Self.Translation | null);

		type Children = (Self.VDom.Node | globalThis.Array<Self.VDom.Node>);

		function jsx(type: (string | ((props?: object) => Self.VDomElement)), config?: object, key?: string): Self.VDomElement;

		function render(element: Self.VDom.Node, container: Element): Self.VDomRoot;

		function flushUpdates(): void;

		function cloneHostComponent(element: Self.VDomElement, config: object): Self.VDomElement;

		type ClassList = (string | Self.Style | globalThis.Array<(string | Self.Style)> | Record<string, (string | Self.Style)>);

		function classNames(...values: globalThis.Array<Self.VDom.ClassList>): globalThis.Array<string>;

		function domElementProps(element: HTMLElement, options: {withIds?: boolean}): object;

		function fromDom(element: Element, options: {withIds?: boolean}): Self.VDomElement;

		function fromString(string: string): Self.VDomElement;

		function children(children: Self.VDom.Children, omitEmpty?: boolean): globalThis.Array<Self.VDom.Node>;

		function getHost(element: Element): (PackageComponent.Host | null);

		function Fragment(props: {children?: Self.VDom.Children}): Self.VDomElement;

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

		function Context(props: (Self.VDom.SingleContextProps | Self.VDom.MultipleContextProps)): Self.VDomElement;

		function ElementDecorator(props: object): Self.VDomElement;

		function MessageFilter(props: object): Self.VDomElement;

		function ContextPortal(props: object): Self.VDomElement;

		function ref<T = any>(): Self.VDomRef<T>;

		export import Element = Self.VDomElement;

		export import Ref = Self.VDomRef;

	}

	export class VDomElement {
		tag: Self.VDomFiberTag;

		type: (string | symbol | ((props: any) => Self.VDomElement));

		props: any;

		key: any;

		ref: (Self.VDomRef | null);

		constructor(tag: Self.VDomFiberTag, type: (string | symbol | ((props: any) => Self.VDomElement)), key: any, ref: (Self.VDomRef | null), props: any, flags: number);

		cloneWithProps(props: object): Self.VDomElement;

		cloneWithType(type: any): Self.VDomElement;

		cloneWithRef(ref: Self.VDomRef): Self.VDomElement;

		cloneWithChildren(children: Self.VDom.Children): Self.VDomElement;

		isHostComponent(): boolean;

		static text(text: string): Self.VDomElement;

		static fragment(children: Self.VDom.Children): Self.VDomElement;

		static hostComponentInstance(node: Element): Self.VDomElement;

		static legacyComponentInstance(instance: Self.Component): Self.VDomElement;

		static errorNode(error?: Error): Self.VDomElement;

	}

	export namespace VDomElement {
	}

	class VDomFiber {
	}

	namespace VDomFiber {
	}

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

	class VDomHook {
		constructor(tag: Self.VDomHookTag);

	}

	namespace VDomHook {
	}

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

	export class VDomRef<T = any> {
		constructor(initial?: T);

		current: T;

	}

	export namespace VDomRef {
	}

	class VDomRoot {
		constructor(container: Element, host?: PackageComponent.Host);

	}

	namespace VDomRoot {
	}

	export class ValueChangeMessage extends Self.RoutedMessage {
		constructor(options: Self.ValueChangeMessage.Options);

		element: Element;

		static fromEvent(event: InputEvent): Self.ValueChangeMessage;

	}

	export namespace ValueChangeMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

		}

	}

	export class Vector {
		constructor(x: number, y: number);

		add(right: Self.Vector): Self.Vector;

		addScalar(value: number): Self.Vector;

		subtract(right: Self.Vector): Self.Vector;

		subtractScalar(value: number): Self.Vector;

		multiply(right: Self.Vector): Self.Vector;

		multiplyByScalar(value: number): Self.Vector;

		divide(right: Self.Vector): Self.Vector;

		divideByScalar(value: number): Self.Vector;

		max(right: Self.Vector): Self.Vector;

		min(right: Self.Vector): Self.Vector;

		length(): number;

		static add(left: Self.Vector, right: Self.Vector): Self.Vector;

		static addScalar(vector: Self.Vector, value: number): Self.Vector;

		static subtract(left: Self.Vector, right: Self.Vector): Self.Vector;

		static subtractScalar(vector: Self.Vector, value: Self.Vector): Self.Vector;

		static multiply(left: Self.Vector, right: Self.Vector): Self.Vector;

		static multiplyByScalar(vector: Self.Vector, value: number): Self.Vector;

		static divide(left: Self.Vector, right: Self.Vector): Self.Vector;

		static divideByScalar(vector: Self.Vector, value: number): Self.Vector;

		static max(left: Self.Vector, right: Self.Vector): Self.Vector;

		static min(left: Self.Vector, right: Self.Vector): Self.Vector;

		static calculateLength(vector: Self.Vector): number;

	}

	export namespace Vector {
	}

	export class ViewMessage extends Self.RoutedMessage {
		constructor(options: Self.ViewMessage.Options);

		element: Element;

		static fromEvent(event: Event): Self.ViewMessage;

	}

	export namespace ViewMessage {
		interface Options extends Self.RoutedMessage.Options {
			element: Element;

		}

	}

	export class WindowManager {
		constructor();

		windows: globalThis.Array<PackageComponent.Window>;

		topMostModal: PackageComponent.Window;

		open(window: PackageComponent.Window, filter: Self.RoutedMessage.Filter): void;

		close(window: PackageComponent.Window): void;

		activate(window: PackageComponent.Window): void;

		processMessage(next: Self.RoutedMessage.Handler, message: object, result: object): void;

	}

	export namespace WindowManager {
	}

	function dateParser(tokenList: RegExp, string: string, format: string, options?: object): object;

	function generateTokens(): object;

	function reconstructFiberChildren(fiber: Self.VDomFiber): void;

	function reconstructFiberPath(node: Node): Self.VDomFiber;

	export function useCallback<T extends Function>(callback: T, dependencies?: globalThis.Array<any>): T;

	export function useContext<T = any>(type: string): T;

	export function useDispatch(): Self.Store.DispatchFunc;

	export function useEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

	export function useId(): string;

	export function useLayoutEffect(create: () => (Self.Hook.EffectCleanupCallback | void), dependencies?: globalThis.Array<any>): void;

	export function useMemo<T>(create: () => T, dependencies?: globalThis.Array<any>): T;

	export function useReducer(reducer: (state: any, action: object) => any, initialState: any): [any, (action: object) => any];

	export function useRef<T = any>(initialValue?: T): Self.VDomRef<T>;

	export function useSelector<State, Selected>(selector: (state: State) => Selected, equalityFn?: (left: Selected, right: Selected) => boolean): Selected;

	export function useState<T = any>(initialState: T): [T, (state: T) => void];

	export function useStyles(provider: (theme: Self.Theme) => object): any;

}
