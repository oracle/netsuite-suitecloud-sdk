declare module '@uif-js/component' {
	import * as PackageCore from '@uif-js/core'
	import * as Self from '@uif-js/component'

	export class AccordionItemHeader extends PackageCore.Component {
		constructor(options?: Self.AccordionItemHeader.Options);

		label: (string | PackageCore.Translation);

		icon: object;

		contextControls: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

		actionControls: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

		expanded: boolean;

		defaultExpanded: boolean;

		expandedIcon: boolean;

		setLabel(label: string, reason: string): void;

		setIcon(icon: (PackageCore.ImageMetadata | null)): void;

		setExpandedIcon(icon: (PackageCore.ImageMetadata | null)): void;

		setExpanded(expanded: boolean): void;

		static Event: Self.AccordionItemHeader.EventTypes;

	}

	export namespace AccordionItemHeader {
		interface EventTypes extends PackageCore.Component.EventTypes {
			EXPANDED: string;

		}

		interface Options extends PackageCore.Component.Options {
			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation);

			contextControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			actionControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			expanded?: boolean;

			defaultExpanded?: boolean;

			expandedIcon?: Self.Image.Source;

		}

	}

	export class AccordionPanel extends PackageCore.Component {
		constructor(options?: Self.AccordionPanel.Options);

		items: globalThis.Array<Self.AccordionPanelItem>;

		element: Self.AccordionPanel.Element;

		components: globalThis.Array<PackageCore.Component>;

		children: PackageCore.VDom.Children;

		length: number;

		empty: boolean;

		orientation: Self.AccordionPanel.Orientation;

		fullyCollapsible: boolean;

		multiple: boolean;

		outerGap: (Self.AccordionPanel.GapSize | Self.AccordionPanel.GapSizeObject);

		expandedCount: number;

		decorator: (PackageCore.Decorator | null);

		defaultItemOptions: Self.AccordionPanel.ItemProps;

		add(component: (Self.AccordionPanel.ItemConfiguration | globalThis.Array<Self.AccordionPanel.ItemConfiguration>)): Self.AccordionPanel;

		remove(componentOrIndex: (PackageCore.Component | number | globalThis.Array<(PackageCore.Component | number)>)): Self.AccordionPanel;

		move(args: {component: PackageCore.Component; index?: number; reason?: string}): Self.AccordionPanel;

		clear(): Self.AccordionPanel;

		replace(currentComponent: (PackageCore.Component | number), newComponent: PackageCore.Component): Self.AccordionPanel;

		has(component: PackageCore.Component): boolean;

		itemForComponent(component: PackageCore.Component): Self.AccordionPanelItem;

		itemAtIndex(index: number): Self.AccordionPanelItem;

		setOrientation(orientation: Self.AccordionPanel.Orientation): void;

		setMultiple(multiple: boolean): void;

		setFullyCollapsible(value: boolean): void;

		expand(component: (PackageCore.Component | number)): void;

		collapse(component: (PackageCore.Component | number)): void;

		toggle(component: (PackageCore.Component | number)): void;

		collapseAll(): void;

		expandAll(): void;

		collapseOthers(component: (PackageCore.Component | number)): void;

		isExpanded(component: (PackageCore.Component | number)): boolean;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		static horizontal(items?: (object | globalThis.Array<PackageCore.Component> | globalThis.Array<Self.AccordionPanelItem.Options>)): Self.AccordionPanel;

		static Horizontal(): PackageCore.JSX.Element;

		static vertical(items?: (object | globalThis.Array<PackageCore.Component> | globalThis.Array<Self.AccordionPanelItem.Options>)): Self.AccordionPanel;

		static Vertical(): PackageCore.JSX.Element;

		static Item(props?: Self.AccordionPanel.JsxItemProps): PackageCore.JSX.Element;

		static Event: Self.AccordionPanel.EventTypes;

	}

	export namespace AccordionPanel {
		interface BaseItemProps {
			label?: string;

			actionControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			contextControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			expanded?: boolean;

			defaultExpanded?: boolean;

			icon?: Self.Image.Source;

			expandedIcon?: Self.Image.Source;

		}

		interface JsxItemProps extends Self.AccordionPanel.BaseItemProps {
			children?: PackageCore.VDom.Children;

			key?: any;

		}

		interface ItemProps extends Self.AccordionPanel.BaseItemProps {
		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

			ITEM_MOVED: string;

			ITEM_EXPANDED: string;

		}

		interface StructuredItemConfiguration {
			component: PackageCore.Component;

			options?: Self.AccordionPanel.ItemProps;

		}

		interface FlatItemConfiguration extends Self.AccordionPanel.ItemProps {
			component: PackageCore.Component;

		}

		type ItemConfiguration = (PackageCore.Component | Self.AccordionPanel.StructuredItemConfiguration | Self.AccordionPanel.FlatItemConfiguration);

		interface GapSizeObject {
			top?: Self.AccordionPanel.GapSize;

			bottom?: Self.AccordionPanel.GapSize;

			start?: Self.AccordionPanel.GapSize;

			end?: Self.AccordionPanel.GapSize;

			horizontal?: Self.AccordionPanel.GapSize;

			vertical?: Self.AccordionPanel.GapSize;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			decorator?: PackageCore.Decorator;

			fullyCollapsible?: boolean;

			items?: (Self.AccordionPanel.ItemConfiguration | globalThis.Array<Self.AccordionPanel.ItemConfiguration>);

			multiple?: boolean;

			orientation?: Self.AccordionPanel.Orientation;

			outerGap?: (Self.AccordionPanel.GapSize | Self.AccordionPanel.GapSizeObject);

			element?: Self.AccordionPanel.Element;

			defaultItemOptions?: Self.AccordionPanel.ItemProps;

		}

		export import VisualStyle = Self.AccordionVisualStyle;

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

		export import GapSize = Self.GapSize;

		export import Decorator = PackageCore.Decorator;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class AccordionPanelItem extends PackageCore.Component {
		constructor(options: Self.AccordionPanelItem.Options);

		component: PackageCore.Component;

		value: any;

		children: PackageCore.VDom.Children;

		header: Self.AccordionItemHeader;

		expanded: boolean;

		icon: Self.Image.Source;

		expandedIcon: Self.Image.Source;

		label: (string | PackageCore.Translation);

		contextControls: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

		actionControls: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

		setExpanded(value: boolean): void;

		static Event: Self.AccordionPanelItem.EventTypes;

	}

	export namespace AccordionPanelItem {
		interface Options {
			children?: PackageCore.VDom.Children;

			label?: (string | PackageCore.Translation);

			expanded?: boolean;

			icon?: Self.Image.Source;

			expandedIcon?: Self.Image.Source;

			contextControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			actionControls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			value?: any;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			EXPANDED: string;

		}

	}

	enum AccordionVisualStyle {
		DEFAULT,
		LIGHT,
	}

	export class ActionCell extends Self.GridCell {
		constructor();

		actions: globalThis.Array<any>;

		defaultActions: globalThis.Array<any>;

		menuActions: globalThis.Array<any>;

		setActions(actions: globalThis.Array<any>): void;

		showAction(actionId: string, visible: boolean): void;

		enableAction(actionId: string, enabled: boolean): void;

		openMenu(): void;

		closeMenu(): void;

	}

	export namespace ActionCell {
	}

	export class ActionColumn extends Self.GridColumn {
		constructor(options: Self.ActionColumn.Options);

		actions: (globalThis.Array<Self.ActionColumn.ActionDefinition> | Self.ActionColumn.ActionProvider);

		showAction(actionId: string, visible: boolean): void;

		enableAction(actionId: string, enabled: boolean): void;

	}

	export namespace ActionColumn {
		interface Options extends Self.GridColumn.Options {
			actions?: (globalThis.Array<Self.ActionColumn.ActionDefinition> | Self.ActionColumn.ActionProvider);

		}

		type ActionProvider = (cell: Self.GridCell) => globalThis.Array<Self.ActionColumn.ActionDefinition>;

		interface ActionDefinition {
			id?: string;

			default?: boolean;

			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation);

			action?: () => void;

			type?: Self.Button.Type;

		}

		export import Cell = Self.ActionCell;

	}

	class AdminDocsSystemHeader extends PackageCore.Component {
		constructor(options?: Self.AdminDocsSystemHeader.Options);

		grid: PackageCore.JSX.Element;

		homeButtonOptions: Self.Button.Options;

		logos: globalThis.Array<PackageCore.JSX.Element>;

		logoutButtonOptions: Self.Button.Options;

		environment: Self.AdminDocsSystemHeader.Environment;

	}

	namespace AdminDocsSystemHeader {
		interface Options extends PackageCore.Component.Options {
			grid?: PackageCore.JSX.Element;

			homeButtonOptions?: Self.Button.Options;

			logos?: globalThis.Array<PackageCore.JSX.Element>;

			logoutButtonOptions?: Self.Button.Options;

			environment?: Self.SystemHeader.Environment;

		}

		enum Environment {
			PRODUCTION,
			RELEASE_PREVIEW,
			SANDBOX,
			F,
			SNAP,
			DEBUGGER,
		}

	}

	export class Agenda extends PackageCore.Component {
		constructor(options?: Self.Agenda.Options);

		dayViewConfig: Self.AgendaWeekTimeView.Options;

		events: globalThis.Array<any>;

		highlightWeekends: boolean;

		selectedView: Self.Agenda.CalendarView;

		monthViewConfig: Self.AgendaMonthView.Options;

		readOnly: boolean;

		viewDate: PackageCore.Date;

		weekViewConfig: Self.AgendaWeekTimeView.Options;

		addEvent(event?: object, options?: {reason?: Self.Agenda.Reason}): void;

		removeEvent(event?: object, options?: {reason?: Self.Agenda.Reason}): void;

		static Event: Self.Agenda.EventTypes;

	}

	export namespace Agenda {
		interface EventData {
			name: (string | number | PackageCore.Translation);

			description?: (string | number | PackageCore.Translation);

			start: PackageCore.Date;

			end: PackageCore.Date;

			wholeDay?: boolean;

			color?: Self.AgendaEvent.Color;

			badge?: (string | number | PackageCore.Translation);

		}

		interface Options extends PackageCore.Component.Options {
			viewDate?: PackageCore.Date;

			selectedView?: Self.Agenda.CalendarView;

			events?: globalThis.Array<Self.Agenda.EventData>;

			readOnly?: boolean;

			highlightWeekends?: boolean;

			monthViewConfig?: Self.AgendaMonthView.Options;

			weekViewConfig?: Self.AgendaWeekTimeView.Options;

			dayViewConfig?: Self.AgendaWeekTimeView.Options;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			EVENT_ADD: symbol;

			EVENT_REMOVE: symbol;

		}

		export import Reason = Self.AgendaConstant.Reason;

		enum CalendarView {
			MONTH,
			WEEK,
			DAY,
			AGENDA,
		}

		export import View = Self.AgendaView;

		export import DayView = Self.AgendaDayView;

		export import MonthView = Self.AgendaMonthView;

		export import WeekTimeView = Self.AgendaWeekTimeView;

		export import AgendaEvent = Self.AgendaEvent;

	}

	namespace AgendaConstant {
		enum Event {
			EVENT_ADD,
			EVENT_REMOVE,
		}

		enum Reason {
			USER_CALL,
			INTERNAL_CALL,
		}

	}

	class AgendaDayTimeCell extends PackageCore.Component {
		constructor(options?: Self.AgendaDayTimeCell.Options);

		clickAction: (((date: PackageCore.Date) => void) | null);

		time: PackageCore.Date;

	}

	namespace AgendaDayTimeCell {
		interface Options extends PackageCore.Component.Options {
			time?: PackageCore.Date;

			clickAction?: (date: PackageCore.Date) => void;

		}

	}

	export class AgendaDayTimeGrid extends PackageCore.Component {
		constructor(options?: Self.AgendaDayTimeGrid.Options);

		background: Self.AgendaDayTimeGrid.Background;

		timeClickAction: (((time: (PackageCore.Date | PackageCore.Time)) => void) | null);

		eventClickAction: (((event: Self.Agenda.EventData) => void) | null);

		events: globalThis.Array<Self.Agenda.EventData>;

		readOnly: boolean;

		viewDate: PackageCore.Date;

		addEvent(event?: object, options?: {reason?: Self.AgendaDayTimeGrid.Reason}): void;

		removeEvent(event?: object, options?: {reason?: Self.AgendaDayTimeGrid.Reason}): void;

		static Event: Self.Agenda.EventTypes;

	}

	export namespace AgendaDayTimeGrid {
		interface Options extends PackageCore.Component.Options {
			viewDate?: PackageCore.Date;

			events?: globalThis.Array<Self.Agenda.EventData>;

			background?: Self.AgendaDayTimeGrid.Background;

			readOnly?: boolean;

			timeClickAction?: (time: (PackageCore.Date | PackageCore.Time)) => void;

			eventClickAction?: (event: Self.Agenda.EventData) => void;

		}

		export import Reason = Self.AgendaConstant.Reason;

		enum Background {
			WEAK,
			MEDIUM,
			STRONG,
		}

	}

	export class AgendaDayView extends PackageCore.Component {
		constructor(options?: Self.AgendaDayView.Options);

		background: Self.AgendaDayView.Background;

		clickAction: (((date: PackageCore.Date) => void) | null);

		eventClickAction: (((event: Self.Agenda.EventData) => void) | null);

		description: (string | number | PackageCore.Translation);

		icon: Self.Image.Source;

		events: globalThis.Array<Self.Agenda.EventData>;

		eventsLimit: number;

		showHeader: boolean;

		showLongViewDate: boolean;

		showMoreAction: (date: PackageCore.Date) => void;

		summary: Self.AgendaDayView.Summary;

		readOnly: boolean;

		viewDate: PackageCore.Date;

		addEvent(event?: object, options?: {reason?: Self.AgendaDayView.Reason}): void;

		removeEvent(event?: object, options?: {reason?: Self.AgendaDayView.Reason}): void;

		static Event: Self.Agenda.EventTypes;

	}

	export namespace AgendaDayView {
		interface Options extends PackageCore.Component.Options {
			viewDate?: PackageCore.Date;

			description?: (string | number | PackageCore.Translation);

			icon?: PackageCore.ImageMetadata;

			events?: globalThis.Array<Self.Agenda.EventData>;

			summary?: Self.AgendaDayView.Summary;

			background?: Self.AgendaDayView.Background;

			eventsLimit?: number;

			showHeader?: boolean;

			showLongViewDate?: boolean;

			readOnly?: boolean;

			clickAction?: (date: PackageCore.Date) => void;

			eventClickAction?: (event: Self.Agenda.EventData) => void;

			showMoreAction?: (date: PackageCore.Date) => void;

		}

		interface Summary {
			text: (string | PackageCore.Translation);

			action: (date: PackageCore.Date) => void;

		}

		export import Reason = Self.AgendaConstant.Reason;

		enum Background {
			WEAK,
			MEDIUM,
			STRONG,
		}

	}

	export class AgendaEvent extends PackageCore.Component {
		constructor(options?: Self.AgendaEvent.Options);

		event: Self.Agenda.EventData;

		badge: (string | number | PackageCore.Translation);

		clickAction: (((event: Self.Agenda.EventData) => void) | null);

		readOnly: boolean;

	}

	export namespace AgendaEvent {
		interface Options extends PackageCore.Component.Options {
			event?: Self.Agenda.EventData;

			showDescription?: boolean;

			badge?: (string | number | PackageCore.Translation);

			clickAction?: (event: Self.Agenda.EventData) => void;

		}

		enum Color {
			AZURE,
			RED,
			PINK,
			PURPLE,
			THEMED,
			NEUTRAL,
		}

	}

	class AgendaEventPlaceholder extends PackageCore.Component {
		constructor(options?: Self.AgendaEventPlaceholder.Options);

		dark: boolean;

	}

	namespace AgendaEventPlaceholder {
		interface Options extends PackageCore.Component.Options {
			dark?: boolean;

		}

	}

	export class AgendaMonthView extends PackageCore.Component {
		constructor(options?: Self.AgendaMonthView.Options);

		daysConfig: (date: PackageCore.Date) => Self.AgendaDayView.Options;

		events: globalThis.Array<Self.Agenda.EventData>;

		highlightWeekends: boolean;

		showHeader: boolean;

		startingDay: number;

		readOnly: boolean;

		viewDate: PackageCore.Date;

		weeksCount: number;

		dayClickAction: (((date: PackageCore.Date) => void) | null);

		eventClickAction: (((event: Self.Agenda.EventData) => void) | null);

		showMoreAction: (((date: PackageCore.Date) => void) | null);

		addEvent(event?: object, options?: {reason?: Self.AgendaMonthView.Reason}): void;

		removeEvent(event?: object, options?: {reason?: Self.AgendaMonthView.Reason}): void;

		getEventsFromDate(date?: PackageCore.Date): void;

		static Event: Self.Agenda.EventTypes;

	}

	export namespace AgendaMonthView {
		interface Options extends PackageCore.Component.Options {
			viewDate?: PackageCore.Date;

			startingDay?: number;

			events?: globalThis.Array<Self.Agenda.EventData>;

			showHeader?: boolean;

			highlightWeekends?: boolean;

			weeksCount?: number;

			dayClickAction?: (date: PackageCore.Date) => void;

			eventClickAction?: (event: Self.Agenda.EventData) => void;

			showMoreAction?: (date: PackageCore.Date) => void;

			daysConfig?: (date: PackageCore.Date) => Self.AgendaDayView.Options;

		}

		export import Reason = Self.AgendaConstant.Reason;

	}

	export class AgendaView extends PackageCore.Component {
		constructor(options?: Self.AgendaView.Options);

		events: globalThis.Array<Self.Agenda.EventData>;

		readOnly: boolean;

		showDate: boolean;

		showDay: boolean;

		viewDate: PackageCore.Date;

		eventClickAction: (((event: Self.Agenda.EventData) => void) | null);

	}

	export namespace AgendaView {
		interface Options extends PackageCore.Component.Options {
			events?: globalThis.Array<Self.Agenda.EventData>;

			viewDate?: PackageCore.Date;

			showDate?: boolean;

			showDay?: boolean;

			readOnly?: boolean;

			eventClickAction?: (event: Self.Agenda.EventData) => void;

		}

	}

	export class AgendaViewHeader extends PackageCore.Component {
		constructor(options?: Self.AgendaViewHeader.Options);

		highlightedDate: PackageCore.Date;

		length: number;

		showDate: boolean;

		showDay: boolean;

		startDate: PackageCore.Date;

	}

	export namespace AgendaViewHeader {
		interface Options extends PackageCore.Component.Options {
			startDate?: PackageCore.Date;

			length?: number;

			showDate?: boolean;

			showDay?: boolean;

			highlightedDate?: PackageCore.Date;

		}

	}

	export class AgendaWeekTimeView extends PackageCore.Component {
		constructor(options?: Self.AgendaWeekTimeView.Options);

		daysCount: object;

		daysConfig: (date: PackageCore.Date) => Self.AgendaDayView.Options;

		events: globalThis.Array<Self.Agenda.EventData>;

		showHeader: boolean;

		readOnly: boolean;

		startingDay: number;

		viewDate: PackageCore.Date;

		timeClickAction: (((date: PackageCore.Date) => void) | null);

		dayClickAction: (((date: PackageCore.Date) => void) | null);

		eventClickAction: (((event: Self.Agenda.EventData) => void) | null);

		addEvent(event?: object, options?: {reason?: Self.AgendaWeekTimeView.Reason}): void;

		removeEvent(event?: object, options?: {reason?: Self.AgendaWeekTimeView.Reason}): void;

		getEventsFromDate(date?: PackageCore.Date): void;

		static Event: Self.Agenda.EventTypes;

	}

	export namespace AgendaWeekTimeView {
		interface Options extends PackageCore.Component.Options {
			viewDate?: PackageCore.Date;

			events?: globalThis.Array<Self.Agenda.EventData>;

			showHeader?: boolean;

			readOnly?: boolean;

			startingDay?: number;

			daysCount?: number;

			timeClickAction?: (date: PackageCore.Date) => void;

			dayClickAction?: (date: PackageCore.Date) => void;

			eventClickAction?: (event: Self.Agenda.EventData) => void;

			daysConfig?: (date: PackageCore.Date) => Self.AgendaDayView.Options;

		}

		export import Reason = Self.AgendaConstant.Reason;

	}

	export class ApplicationHeader extends PackageCore.Component {
		constructor(options?: Self.ApplicationHeader.Options);

		title: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		subtitle: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		badge: (string | number | PackageCore.Translation | Self.Badge.Options);

		icon: (object | globalThis.Array<any> | string | PackageCore.ImageMetadata | PackageCore.Component | PackageCore.JSX.Element);

		actions: (Self.ApplicationHeader.ActionGroup | globalThis.Array<Self.ApplicationHeader.ActionGroup>);

		links: globalThis.Array<Self.ApplicationHeader.LinkDefinition>;

		tools: (PackageCore.Component | PackageCore.JSX.Element);

		outerGap: Self.ApplicationHeader.GapSize;

		titlePanelCollapsible: boolean;

		titlePanelCollapsed: boolean;

		setTitle(title: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)): void;

		setSubtitle(subtitle: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)): void;

		setBadge(badge: (string | number | PackageCore.Translation)): void;

		setIcon(icon: (object | globalThis.Array<any> | string | PackageCore.ImageMetadata)): void;

		setLinks(links: globalThis.Array<Self.ApplicationHeader.LinkDefinition>): void;

		setActions(actions: globalThis.Array<Self.ApplicationHeader.ActionDefinition>): void;

		setTools(tools: (PackageCore.Component | PackageCore.JSX.Element)): void;

		getAction(actionId?: number): (Self.ApplicationHeader.ActionHandle | null);

	}

	export namespace ApplicationHeader {
		interface LinkDefinition {
			label?: (string | PackageCore.Translation);

			url?: (string | PackageCore.Url);

			route?: (string | PackageCore.Route | Self.Link.Route);

		}

		interface ActionDefinition {
			action?: () => void;

			enabled?: boolean;

			id?: string;

			label?: (string | PackageCore.Translation);

			type?: Self.ApplicationHeader.ActionType;

			automationId?: string;

		}

		interface ActionHandle {
			setEnabled?: (enabled: boolean) => Self.ApplicationHeader.ActionHandle;

			setLabel?: (label: (string | PackageCore.Translation)) => Self.ApplicationHeader.ActionHandle;

		}

		type ActionGroup = globalThis.Array<(Self.ApplicationHeader.ActionDefinition | PackageCore.JSX.Element)>;

		interface GapSizeObject {
			top?: Self.ApplicationHeader.GapSize;

			bottom?: Self.ApplicationHeader.GapSize;

			start?: Self.ApplicationHeader.GapSize;

			end?: Self.ApplicationHeader.GapSize;

			horizontal?: Self.ApplicationHeader.GapSize;

			vertical?: Self.ApplicationHeader.GapSize;

		}

		interface Options extends PackageCore.Component.Options {
			actions?: (Self.ApplicationHeader.ActionGroup | globalThis.Array<Self.ApplicationHeader.ActionGroup>);

			icon?: (object | globalThis.Array<any> | string | PackageCore.ImageMetadata | PackageCore.Component | PackageCore.JSX.Element);

			links?: globalThis.Array<Self.ApplicationHeader.LinkDefinition>;

			badge?: (string | number | PackageCore.Translation | Self.Badge.Options);

			subtitle?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			title?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			tools?: (PackageCore.Component | PackageCore.JSX.Element);

			outerGap?: (Self.ApplicationHeader.GapSize | Self.ApplicationHeader.GapSizeObject);

			titlePanelCollapsible?: boolean;

			titlePanelCollapsed?: boolean;

		}

		enum ActionType {
			PRIMARY,
			SECONDARY,
			GHOST,
		}

		export import GapSize = Self.GapSize;

	}

	export class Avatar extends PackageCore.Component {
		constructor(options?: Self.Avatar.Options);

		content: (string | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.ImageMetadata.Options);

		presentation: boolean;

		size: Self.Avatar.Size;

		color: (Self.Avatar.Color | Self.Avatar.RefreshedColor | Self.Avatar.RedwoodColor);

		borderRadius: Self.Avatar.BorderRadius;

		setContent(content: (string | PackageCore.Translation | object | PackageCore.ImageMetadata)): void;

		setSize(size: Self.Avatar.Size): void;

		setColor(color: (Self.Avatar.Color | Self.Avatar.RefreshedColor | Self.Avatar.RedwoodColor)): void;

		setBorderRadius(borderRadius: Self.Avatar.BorderRadius): void;

		setPresentation(presentation: boolean): void;

	}

	export namespace Avatar {
		interface Options extends PackageCore.Component.Options {
			borderRadius?: Self.Avatar.BorderRadius;

			content: (string | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.ImageMetadata.Options);

			presentation?: boolean;

			size?: Self.Avatar.Size;

			color?: (Self.Avatar.Color | Self.Avatar.RefreshedColor | Self.Avatar.RedwoodColor);

		}

		export import Size = PackageCore.ImageConstant.Size;

		enum Color {
			DEFAULT,
			THEMED,
		}

		enum RefreshedColor {
			PURPLE,
			YELLOW,
			GREEN,
			PINK,
			TURQUOISE,
			BROWN,
			LIGHT,
		}

		enum RedwoodColor {
			BLUE,
			GRAY,
			LILAC,
			TEAL,
			PINK,
			PURPLE,
			GREEN,
			SLATE,
		}

		export import BorderRadius = PackageCore.ImageConstant.BorderRadius;

	}

	export class Badge extends PackageCore.Component {
		constructor(options?: Self.Badge.Options);

		content: (string | number | PackageCore.Translation | PackageCore.JSX.Element);

		children: PackageCore.VDom.Children;

		type: Self.Badge.Type;

		size: Self.Badge.Size;

		start: boolean;

		end: boolean;

		setContent(content: (string | number | PackageCore.Translation)): void;

		setType(type: Self.Badge.Type): void;

		setSize(size: Self.Badge.Size): void;

		setStart(start: boolean): void;

		setEnd(end: boolean): void;

	}

	export namespace Badge {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (string | number | PackageCore.Translation);

			end?: boolean;

			type?: Self.Badge.Type;

			size?: Self.Badge.Size;

			start?: boolean;

		}

		enum Type {
			SOLID,
			SUBTLE,
		}

		enum Size {
			DEFAULT,
			SMALL,
		}

	}

	export class Banner extends PackageCore.Component {
		constructor(options?: Self.Banner.Options);

		button: (Self.Button.Options | null);

		color: Self.Banner.Color;

		content: (PackageCore.Component | PackageCore.JSX.Element);

		closeAction: (Self.Button.ActionCallback | null);

		dontShowAgainAction: (Self.Button.ActionCallback | null);

		imageUrl: (string | null);

		title: (null | string | number | PackageCore.Translation);

		showControls: boolean;

	}

	export namespace Banner {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (PackageCore.Component | PackageCore.JSX.Element);

			title?: (string | number | PackageCore.Translation);

			imageUrl?: string;

			color?: Self.Banner.Color;

			showControls?: boolean;

			button?: Self.Button.Options;

			dontShowAgainAction?: Self.CheckBox.ActionCallback;

			closeAction?: Self.Button.ActionCallback;

		}

		enum Color {
			BLUE,
			BLUE_DARK,
			GREEN,
			ORANGE,
		}

		enum I18n {
			DONT_SHOW_AGAIN,
			CLOSE,
		}

	}

	export class BannerMessage extends PackageCore.Component {
		constructor(options?: Self.BannerMessage.Options);

		type: Self.BannerMessage.Type;

		icon: Self.Image.Source;

		layout: Self.BannerMessage.Layout;

		title: (string | PackageCore.Translation);

		content: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		children: PackageCore.VDom.Children;

		showCloseButton: boolean;

		close(options?: object): void;

		static Event: Self.BannerMessage.EventTypes;

	}

	export namespace BannerMessage {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			layout?: Self.BannerMessage.Layout;

			showCloseButton?: boolean;

			title?: (string | PackageCore.Translation);

			icon?: Self.Image.Source;

			type?: Self.BannerMessage.Type;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLOSED: string;

		}

		export import Type = PackageCore.UserMessageService.MessageType;

		enum Layout {
			DEFAULT,
			INLINE,
		}

		enum Reason {
			CALL,
			CLOSE_BUTTON,
		}

	}

	export class BannerPanel extends PackageCore.Component {
		constructor(options?: Self.BannerPanel.Options);

		messages: globalThis.Array<Self.BannerMessage>;

		manual: boolean;

		add(message: (Self.BannerMessage | globalThis.Array<Self.BannerMessage>)): void;

		remove(message: Self.BannerMessage): void;

		clear(): void;

		createUserMessage(message: PackageCore.UserMessageService.MessageOptions): Self.BannerMessage;

		connect(service: PackageCore.UserMessageService): void;

		disconnect(): void;

	}

	export namespace BannerPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			messages?: globalThis.Array<Self.BannerMessage>;

			position?: Self.BannerPanel.Position;

			manual?: boolean;

		}

		enum Position {
			RELATIVE,
			ABSOLUTE,
		}

	}

	namespace BaseBundle {
	}

	class BlankPortlet extends PackageCore.Component {
		constructor(options?: Self.BlankPortlet.Options);

	}

	namespace BlankPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class BloomPanel extends PackageCore.Component {
		constructor(options?: Self.BloomPanel.Options);

		active: boolean;

		content: any;

		children: PackageCore.VDom.Children;

	}

	export namespace BloomPanel {
		interface Options extends PackageCore.Component.Options {
			active?: boolean;

		}

	}

	export class Breadcrumbs extends PackageCore.Component {
		constructor(options?: Self.Breadcrumbs.Options);

		children: PackageCore.VDom.Children;

		items: globalThis.Array<Self.BreadcrumbsItem.Options>;

		expanded: boolean;

		size: Self.Breadcrumbs.Size;

		expandStrategy: Self.Breadcrumbs.ExpandStrategy;

		overflowStrategy: Self.Breadcrumbs.OverflowStrategy;

		separatorSymbol: (Self.Breadcrumbs.SeparatorSymbol | string);

		setExpanded(value: boolean): void;

		toggleExpanded(): void;

		autoCollapse(): void;

		private parseChildren(children: PackageCore.VDom.Children): globalThis.Array<Self.BreadcrumbsItem.Options>;

		private createExpandedItems(): globalThis.Array<Self.BreadcrumbsItem>;

		private createCollapsedItems(): globalThis.Array<Self.BreadcrumbsItem>;

		private createCollapsedItem(): Self.BreadcrumbsItem;

		private createItems(): globalThis.Array<Self.BreadcrumbsItem>;

		static getStyles(): void;

		static getRefreshedStyles(): void;

		static getRedwoodStyles(): void;

		static Item(props?: Self.BreadcrumbsItem.BaseProps): PackageCore.JSX.Element;

	}

	export namespace Breadcrumbs {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			expandStrategy?: Self.Breadcrumbs.ExpandStrategy;

			overflowStrategy?: Self.Breadcrumbs.OverflowStrategy;

			size?: Self.Breadcrumbs.Size;

			separatorSymbol?: (Self.Breadcrumbs.SeparatorSymbol | string);

			items?: globalThis.Array<Self.BreadcrumbsItem.Options>;

			expanded?: boolean;

		}

		export import Size = Self.BreadcrumbsItem.Size;

		export import SeparatorSymbol = Self.BreadcrumbsItem.SeparatorSymbol;

		export import IconPosition = Self.BreadcrumbsItem.IconPosition;

		export import ItemType = Self.BreadcrumbsItem.Type;

		enum ExpandStrategy {
			EXPAND,
			MENU,
			NONE,
		}

		enum OverflowStrategy {
			WRAP,
			COLLAPSE,
			NONE,
		}

	}

	export class BreadcrumbsItem extends PackageCore.Component {
		constructor(options?: Self.BreadcrumbsItem.Options);

		label: (string | number | PackageCore.Translation);

		icon: Self.Image.Source;

		iconPosition: Self.BreadcrumbsItem.IconPosition;

		size: Self.BreadcrumbsItem.Size;

		expandable: boolean;

		collapsible: boolean;

		separatorSymbol: (Self.BreadcrumbsItem.SeparatorSymbol | string);

		url: (string | PackageCore.Url);

		route: (string | PackageCore.Route | Self.Link.Route);

		type: Self.BreadcrumbsItem.Type;

		menu: globalThis.Array<object>;

		private createTextItem(): globalThis.Array<PackageCore.JSX.Element>;

		private createLinkItem(): PackageCore.JSX.Element;

		private createCollapsedItem(): PackageCore.JSX.Element;

		private createSeparator(): PackageCore.JSX.Element;

		private createMenuButton(): PackageCore.JSX.Element;

		static getStyles(): void;

		static getRefreshedStyles(): void;

		static getRedwoodStyles(): void;

		static Event: Self.BreadcrumbsItem.EventTypes;

	}

	export namespace BreadcrumbsItem {
		interface BaseProps extends PackageCore.Component.Options {
			icon?: Self.Image.Source;

			iconPosition?: Self.BreadcrumbsItem.IconPosition;

			collapsible?: boolean;

			url?: (string | PackageCore.Url);

			route?: (string | PackageCore.Route | Self.Link.Route);

			type?: Self.BreadcrumbsItem.Type;

			size?: Self.BreadcrumbsItem.Size;

			expandable?: boolean;

			separatorSymbol?: Self.BreadcrumbsItem.SeparatorSymbol;

			menu?: globalThis.Array<object>;

			children?: PackageCore.VDom.Children;

		}

		interface Options extends Self.BreadcrumbsItem.BaseProps {
			children?: PackageCore.VDom.Children;

			label?: (string | number | PackageCore.Translation);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			EXPANDED: symbol;

		}

		enum Type {
			TEXT,
			LINK,
			COLLAPSED,
		}

		enum Size {
			REGULAR,
			LARGE,
			LARGER,
		}

		enum IconPosition {
			START,
			END,
		}

		enum SeparatorSymbol {
			SLASH,
			DASH,
			GREATER_THAN,
		}

	}

	export class Button extends PackageCore.Component {
		constructor(options?: Self.Button.Options);

		startIcon: (PackageCore.ImageMetadata | null);

		endIcon: (PackageCore.ImageMetadata | null);

		action: Self.Button.ActionCallback;

		label: (null | string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		hasLabel: boolean;

		icon: (PackageCore.ImageMetadata | null);

		hasIcon: boolean;

		iconPosition: Self.Button.IconPosition;

		size: Self.Button.Size;

		type: Self.Button.Type;

		hierarchy: Self.Button.Hierarchy;

		behavior: Self.Button.Behavior;

		toggled: boolean;

		hasBadge: boolean;

		badge: (boolean | string | number | PackageCore.Translation | Self.Button.BadgeDefinition);

		nativeType: Self.Button.NativeType;

		onToggled: Self.Button.ToggledCallback;

		bloom: boolean;

		setLabel(label: (null | string | number | PackageCore.Translation | PackageCore.Component)): void;

		setIcon(icon: (PackageCore.ImageMetadata | null)): void;

		setBadge(badge: (boolean | string | number | PackageCore.Translation | Self.Button.BadgeDefinition)): void;

		setIconPosition(position: Self.Button.IconPosition): void;

		setSize(size: Self.Button.Size): void;

		setType(type: Self.Button.Type): void;

		setHierarchy(hierarchy: Self.Button.Hierarchy): void;

		click(): void;

		setToggled(toggled: boolean, options?: object): void;

		protected handleClicked(options: object): void;

		static toggle(options: Self.Button.ToggleButtonOptions): Self.Button;

		static Toggle(props: Self.Button.ToggleButtonOptions): PackageCore.JSX.Element;

		static Event: Self.Button.EventTypes;

	}

	export namespace Button {
		interface BadgeDefinition {
			text: (string | number | PackageCore.Translation);

			status?: PackageCore.Component.Status;

		}

		interface Options extends PackageCore.Component.Options {
			action?: Self.Button.ActionCallback;

			badge?: (boolean | string | number | PackageCore.Translation | Self.Button.BadgeDefinition);

			behavior?: Self.Button.Behavior;

			icon?: Self.Image.Source;

			startIcon?: Self.Image.Source;

			endIcon?: Self.Image.Source;

			iconPosition?: Self.Button.IconPosition;

			label?: (null | string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			size?: Self.Button.Size;

			toggled?: boolean;

			type?: Self.Button.Type;

			nativeType?: Self.Button.NativeType;

			onToggled?: Self.Button.ToggledCallback;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

			ACTION: string;

		}

		type ActionCallback = (args: Self.Button.ActionArgs, sender: Self.Button) => void;

		interface ActionArgs {
			toggled: boolean;

			reason: string;

			button: Self.Button;

		}

		type ToggledCallback = (args: Self.Button.ToggledArgs, sender: Self.Button) => void;

		interface ToggledArgs {
			toggled: boolean;

			reason: string;

		}

		interface ToggleButtonOptions extends Self.Button.Options {
		}

		enum Size {
			SMALLER,
			SMALL,
			MEDIUM,
			LARGE,
		}

		enum IconPosition {
			LEFT,
			RIGHT,
			ABOVE,
			BELOW,
			HORIZONTAL,
		}

		enum Type {
			DEFAULT,
			PRIMARY,
			PURE,
			EMBEDDED,
			GHOST,
			DANGER,
			LINK,
		}

		enum ToggleType {
			DEFAULT,
			GHOST,
			PURE,
		}

		enum NativeType {
			BUTTON,
			SUBMIT,
			RESET,
		}

		enum Hierarchy {
			PRIMARY,
			SECONDARY,
			DANGER,
		}

		enum Behavior {
			DEFAULT,
			TOGGLE,
		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
		}

		enum Reason {
			CLICK,
			KEY_UP,
		}

		enum I18N {
			ABORT,
			CANCEL,
			CLOSE,
			COLLAPSE,
			EXPAND,
			FILL_DOWN,
			MAXIMIZE,
			MINIMIZE,
			OK,
			SEARCH,
			YES,
			NO,
		}

	}

	class CachedDataProvider {
		constructor(options?: Self.CachedDataProvider.Options);

		load(query: any): globalThis.Promise<any>;

	}

	namespace CachedDataProvider {
		interface Options {
			getData?: (test: string) => globalThis.Array<any>;

		}

	}

	export class Calendar extends PackageCore.Component {
		constructor(options?: Self.Calendar.Options);

		selectedDate: (PackageCore.Date | null);

		rangeStart: (PackageCore.Date | null);

		rangeEnd: (PackageCore.Date | null);

		viewDate: PackageCore.Date;

		viewType: Self.Calendar.ViewType;

		baseViewType: Self.Calendar.ViewType;

		today: PackageCore.Date;

		numberOfViews: number;

		startDate: (PackageCore.Date | null);

		endDate: (PackageCore.Date | null);

		firstDayOfWeek: number;

		wheelScrollEnabled: boolean;

		activeDescendant: (PackageCore.Component | null);

		setSelectedDate(date: (PackageCore.Date | null), options?: {updateView?: boolean; reason?: string}): void;

		setRangeStart(date: (PackageCore.Date | null), options?: {reason?: string}): boolean;

		setRangeEnd(date: (PackageCore.Date | null), options?: {reason?: string}): boolean;

		setDateRange(options: {start?: (PackageCore.Date | null); end?: (PackageCore.Date | null)}): void;

		setViewDate(date: PackageCore.Date): void;

		setViewType(type: Self.Calendar.ViewType): void;

		navigate(navigationDirection: Self.Calendar.NavigationDirection): void;

		isDateSelected(date: PackageCore.Date): boolean;

		isDateSelectable(date: PackageCore.Date): boolean;

		isBeforeStart(date: PackageCore.Date): boolean;

		isAfterEnd(date: PackageCore.Date): boolean;

		isInAllowedRange(date: PackageCore.Date): boolean;

		isDateEnabled(date: PackageCore.Date): boolean;

		isRangeInside(date: PackageCore.Date): boolean;

		isRangeEnd(date: PackageCore.Date): boolean;

		isRangeSelectable(date: PackageCore.Date): boolean;

		private _coerceDateRestrictions(date: PackageCore.Date, direction?: number): (PackageCore.Date | null);

		static Event: Self.Calendar.EventTypes;

	}

	export namespace Calendar {
		interface Options extends PackageCore.Component.Options {
			ariaFormat?: string;

			ariaLabel?: string;

			baseViewType?: Self.Calendar.ViewType;

			decadeView?: Self.CalendarDecadeView.Options;

			endDate?: (PackageCore.Date | null);

			firstDayOfWeek?: number;

			monthView?: Self.CalendarMonthView.Options;

			numberOfViews?: number;

			rangeEnd?: (PackageCore.Date | null);

			rangeStart?: (PackageCore.Date | null);

			selectedDate?: (PackageCore.Date | null);

			showNextMonth?: boolean;

			showPreviousMonth?: boolean;

			showWeekNumbers?: boolean;

			startDate?: (PackageCore.Date | null);

			titleMonthFormat?: string;

			titleYearFormat?: string;

			today?: (PackageCore.Date | null);

			viewDate?: (PackageCore.Date | null);

			viewType?: Self.Calendar.ViewType;

			wheelScrollEnabled?: boolean;

			yearView?: Self.CalendarYearView.Options;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			DATE_SELECTED: string;

			DATE_CLICKED: string;

			RANGE_START_SELECTED: string;

			RANGE_END_SELECTED: string;

		}

		export import Day = Self.CalendarDay;

		export import Month = Self.CalendarMonth;

		export import MonthView = Self.CalendarMonthView;

		export import Year = Self.CalendarYear;

		export import YearView = Self.CalendarYearView;

		export import DecadeView = Self.CalendarDecadeView;

		enum ViewType {
			MONTH,
			YEAR,
			DECADE,
		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
		}

		enum NavigationDirection {
			PREVIOUS_VIEW,
			PREVIOUS_ROW,
			PREVIOUS_ITEM,
			NEXT_VIEW,
			NEXT_ROW,
			NEXT_ITEM,
			FIRST_ITEM,
			LAST_ITEM,
		}

	}

	export class CalendarDay extends PackageCore.Component {
		constructor(options: Self.CalendarDay.Options);

		date: PackageCore.Date;

		selected: boolean;

		selectable: boolean;

		today: boolean;

		beforeStart: boolean;

		afterEnd: boolean;

		previousMonth: boolean;

		nextMonth: boolean;

		rangeStart: boolean;

		rangeInside: boolean;

		rangeEnd: boolean;

		customizeDay: (Self.CalendarDay.CustomizeCallback | null);

		static Event: Self.CalendarDay.EventTypes;

	}

	export namespace CalendarDay {
		interface Options extends PackageCore.Component.Options {
			date?: PackageCore.Date;

			ariaLabel?: string;

			selected?: boolean;

			selectable?: boolean;

			today?: boolean;

			beforeStart?: boolean;

			afterEnd?: boolean;

			previousMonth?: boolean;

			nextMonth?: boolean;

			rangeStart?: boolean;

			rangeInside?: boolean;

			rangeEnd?: boolean;

			customizeDay?: Self.CalendarDay.CustomizeCallback;

		}

		type CustomizeCallback = (args: {date: PackageCore.Date; day: Self.CalendarDay}) => void;

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLICKED: string;

		}

		enum DayStatus {
			SELECTED,
			SELECTABLE,
			TODAY,
			BEFORE_START,
			AFTER_END,
			PREVIOUS_MONTH,
			NEXT_MONTH,
			RANGE_START,
			RANGE_INSIDE,
			RANGE_END,
		}

	}

	export class CalendarDecadeView extends PackageCore.Component {
		constructor(options: Self.CalendarDecadeView.Options);

		viewDate: PackageCore.Date;

		selectedDate: (PackageCore.Date | null);

		today: PackageCore.Date;

		startDate: (PackageCore.Date | null);

		endDate: (PackageCore.Date | null);

		ariaFormat: string;

		yearFormat: string;

		isYearDisabled: (((date: PackageCore.Date) => void) | null);

		customizeYear: (Self.CalendarYear.CustomizeCallback | null);

		setViewDate(date: PackageCore.Date): void;

		setSelectedDate(date: (PackageCore.Date | null), options: {reason?: string}): void;

		setDateRange(options: {start: (PackageCore.Date | null); end: (PackageCore.Date | null)}): void;

		yearForDate(date: PackageCore.Date): (Self.CalendarYear | null);

		isYearSelected(date: PackageCore.Date): boolean;

		isYearSelectable(date: PackageCore.Date): boolean;

		isBeforeStart(date: PackageCore.Date): boolean;

		isAfterEnd(date: PackageCore.Date): boolean;

		isInAllowedRange(date: PackageCore.Date): boolean;

		isYearEnabled(date: PackageCore.Date): boolean;

		static decadeStart(date: PackageCore.Date): void;

		static Event: Self.CalendarDecadeView.EventTypes;

	}

	export namespace CalendarDecadeView {
		interface Options extends PackageCore.Component.Options {
			viewDate: PackageCore.Date;

			ariaFormat: string;

			selectedDate?: PackageCore.Date;

			today?: PackageCore.Date;

			startDate?: PackageCore.Date;

			endDate?: PackageCore.Date;

			isYearDisabled?: (date: PackageCore.Date) => boolean;

			customizeYear?: Self.CalendarYear.CustomizeCallback;

			yearFormat?: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			YEAR_SELECTED: string;

			YEAR_CLICKED: string;

		}

	}

	export class CalendarMonth extends PackageCore.Component {
		constructor(options: Self.CalendarMonth.Options);

		date: PackageCore.Date;

		label: string;

		selected: boolean;

		selectable: boolean;

		today: boolean;

		beforeStart: boolean;

		afterEnd: boolean;

		customizeMonth: (Self.CalendarMonth.CustomizeCallback | null);

		setSelected(value: boolean): void;

		setSelectable(value: boolean): void;

		setBeforeStart(value: boolean): void;

		setAfterEnd(value: boolean): void;

		static Event: Self.CalendarMonth.EventTypes;

	}

	export namespace CalendarMonth {
		interface Options extends PackageCore.Component.Options {
			date: PackageCore.Date;

			label: string;

			selected: boolean;

			selectable: boolean;

			today: boolean;

			beforeStart: boolean;

			afterEnd: boolean;

			customizeMonth: Self.CalendarMonth.CustomizeCallback;

		}

		type CustomizeCallback = (args: {date: PackageCore.Date; month: Self.CalendarMonth}) => void;

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLICKED: string;

		}

	}

	export class CalendarMonthView extends PackageCore.Component {
		constructor(options: Self.CalendarMonthView.Options);

		viewDate: PackageCore.Date;

		selectedDate: (PackageCore.Date | null);

		rangeStart: (PackageCore.Date | null);

		rangeEnd: (PackageCore.Date | null);

		today: PackageCore.Date;

		startDate: (PackageCore.Date | null);

		endDate: (PackageCore.Date | null);

		dayLabels: globalThis.Array<any>;

		showPreviousMonth: boolean;

		showNextMonth: boolean;

		showWeekNumbers: boolean;

		firstDayOfWeek: number;

		ariaFormatter: (((date: PackageCore.Date) => string) | null);

		customizeDay: (Self.CalendarDay.CustomizeCallback | null);

		isDayDisabled: (((date: PackageCore.Date) => boolean) | null);

		setViewDate(date: PackageCore.Date): void;

		setSelectedDate(date: (PackageCore.Date | null), options: {reason?: string}): void;

		setRangeStart(date: (PackageCore.Date | null)): void;

		setRangeEnd(date: (PackageCore.Date | null)): void;

		setDateRange(options: {start?: (PackageCore.Date | null); end?: (PackageCore.Date | null)}): void;

		dayForDate(date: PackageCore.Date): (Self.CalendarDay | null);

		isDaySelected(date: PackageCore.Date): boolean;

		isDaySelectable(date: PackageCore.Date): boolean;

		isBeforeStart(date: PackageCore.Date): boolean;

		isAfterEnd(date: PackageCore.Date): boolean;

		isInAllowedRange(date: PackageCore.Date): boolean;

		isRangeStart(date: PackageCore.Date): boolean;

		isRangeInside(date: PackageCore.Date): boolean;

		isRangeEnd(date: PackageCore.Date): boolean;

		isRangeSelectable(date: PackageCore.Date): boolean;

		isDayEnabled(date: PackageCore.Date): boolean;

		static Event: Self.CalendarMonthView.EventTypes;

	}

	export namespace CalendarMonthView {
		interface Options extends PackageCore.Component.Options {
			viewDate: PackageCore.Date;

			selectedDate?: PackageCore.Date;

			today?: PackageCore.Date;

			rangeStart?: PackageCore.Date;

			rangeEnd?: PackageCore.Date;

			startDate?: PackageCore.Date;

			endDate?: PackageCore.Date;

			dayLabels: globalThis.Array<string>;

			firstDayOfWeek?: number;

			showWeekNumbers?: boolean;

			showPreviousMonth?: boolean;

			showNextMonth?: boolean;

			isDayDisabled?: (date: PackageCore.Date) => boolean;

			ariaFormatter?: (date: PackageCore.Date) => string;

			customizeDay?: Self.CalendarDay.CustomizeCallback;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			DAY_SELECTED: string;

			DAY_CLICKED: string;

		}

		enum I18N {
			WEEK,
		}

	}

	export class CalendarPicker extends Self.Picker {
		constructor(options: Self.CalendarPicker.Options);

		calendar: Self.Calendar;

		private _handleDateSelected(args: object, currentDate: PackageCore.Date, oldDate: PackageCore.Date, reason: string): void;

		private _handleDateClicked(args: {date: PackageCore.Date; viewType: Self.Calendar.ViewType}): void;

		private _setActiveDescendant(): void;

	}

	export namespace CalendarPicker {
		interface Options extends Self.Picker.Options {
			calendar?: (Self.Calendar | Self.Calendar.Options);

			closeOnSelection?: boolean;

			returnSingleValue?: boolean;

		}

	}

	export class CalendarYear extends PackageCore.Component {
		constructor(options: Self.CalendarYear.Options);

		date: PackageCore.Date;

		selected: boolean;

		selectable: boolean;

		today: boolean;

		beforeStart: boolean;

		afterEnd: boolean;

		yearFormat: string;

		customizeYear: Self.CalendarYear.CustomizeCallback;

		setSelected(value: boolean): void;

		setSelectable(value: boolean): void;

		setBeforeStart(value: boolean): void;

		setAfterEnd(value: boolean): void;

		static Event: Self.CalendarYear.EventTypes;

	}

	export namespace CalendarYear {
		interface Options extends PackageCore.Component.Options {
			date: PackageCore.Date;

			selected: boolean;

			selectable: boolean;

			today: boolean;

			beforeStart: boolean;

			afterEnd: boolean;

			yearFormat: string;

			customizeYear: Self.CalendarYear.CustomizeCallback;

		}

		type CustomizeCallback = (args: {date: PackageCore.Date; year: Self.CalendarYear}) => void;

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLICKED: string;

		}

	}

	export class CalendarYearView extends PackageCore.Component {
		constructor(options: Self.CalendarYearView.Options);

		viewDate: PackageCore.Date;

		selectedDate: (PackageCore.Date | null);

		today: PackageCore.Date;

		startDate: (PackageCore.Date | null);

		endDate: (PackageCore.Date | null);

		monthLabels: globalThis.Array<any>;

		isMonthDisabled: (((date: PackageCore.Date) => boolean) | null);

		ariaFormatter: (((date: PackageCore.Date) => string) | null);

		customizeMonth: (Self.CalendarMonth.CustomizeCallback | null);

		setViewDate(date: PackageCore.Date): void;

		setSelectedDate(date: (PackageCore.Date | null), options: {reason?: string}): void;

		setDateRange(options: {start?: (PackageCore.Date | null); end?: (PackageCore.Date | null)}): void;

		monthForDate(date: PackageCore.Date): (Self.CalendarMonth | null);

		isMonthSelected(date: PackageCore.Date): boolean;

		isMonthSelectable(date: PackageCore.Date): boolean;

		isBeforeStart(date: PackageCore.Date): boolean;

		isAfterEnd(date: PackageCore.Date): boolean;

		isInRange(date: PackageCore.Date): boolean;

		isMonthEnabled(date: PackageCore.Date): boolean;

		static Event: Self.CalendarYearView.EventTypes;

	}

	export namespace CalendarYearView {
		interface Options extends PackageCore.Component.Options {
			viewDate: PackageCore.Date;

			selectedDate?: PackageCore.Date;

			today?: PackageCore.Date;

			startDate?: PackageCore.Date;

			endDate?: PackageCore.Date;

			monthLabels?: globalThis.Array<string>;

			isMonthDisabled?: (date: PackageCore.Date) => boolean;

			ariaFormatter?: (date: PackageCore.Date) => string;

			customizeMonth?: Self.CalendarMonth.CustomizeCallback;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			MONTH_SELECTED: string;

			MONTH_CLICKED: string;

		}

	}

	export class Card extends PackageCore.Component {
		constructor(options?: Self.Card.Options);

		action: ((() => void) | null);

		decorator: (PackageCore.Decorator | null);

		image: (Self.Image | null);

		imageSize: Self.Card.ImageSize;

		title: (string | null);

		text: (string | null);

		children: PackageCore.VDom.Children;

		tools: (PackageCore.Component | null);

		mode: Self.Card.Mode;

		draggable: boolean;

		contentGap: (Self.Card.GapSize | Self.Card.GapSizeObject | null);

		hasAction: boolean;

		hasImage: boolean;

		hasText: boolean;

		hasTitle: boolean;

		hasTools: boolean;

		setAction(action: ((() => void) | null)): void;

		setImage(image: (string | PackageCore.Url | Self.Image | null)): void;

		setTitle(title: (string | null)): void;

		setText(text: (string | null)): void;

		setTools(tools: (PackageCore.Component | null)): void;

		setMode(mode: Self.Card.Mode): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		/**
		 * @deprecated Use draggable property on Card
		 */
		static draggableDecorator(options: object): PackageCore.Decorator;

		/**
		 * @deprecated Wrap your component in Card
		 */
		static defaultDecorator(options?: PackageCore.Decorator.Options): PackageCore.Decorator;

		static metric(options: {title: (string | number | PackageCore.Translation); metric: (string | number | PackageCore.Translation); metadata?: (string | number | PackageCore.Translation); description?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element); toolbar?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>); action?: () => void; cardOptions?: Self.Card.Options}): Self.Card;

		static Metric(props: {title: (string | number | PackageCore.Translation); metric: (string | number | PackageCore.Translation); metadata?: (string | number | PackageCore.Translation); children?: PackageCore.VDom.Children; toolbar?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>); action?: () => void; cardOptions?: Self.Card.Options}): PackageCore.JSX.Element;

	}

	export namespace Card {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			decorator?: PackageCore.Decorator;

			image?: (string | PackageCore.Url | Self.Image);

			imageSize?: Self.Card.ImageSize;

			mode?: Self.Card.Mode;

			text?: string;

			title?: string;

			tools?: PackageCore.Component;

			action?: () => void;

			contentGap?: (Self.Card.GapSize | Self.Card.GapSizeObject);

		}

		interface ImageSize {
			aspectRatio?: number;

			height?: string;

			width?: string;

		}

		interface GapSizeObject {
			top?: Self.Card.GapSize;

			bottom?: Self.Card.GapSize;

			start?: Self.Card.GapSize;

			end?: Self.Card.GapSize;

			horizontal?: Self.Card.GapSize;

			vertical?: Self.Card.GapSize;

		}

		export import GapSize = Self.GapSize;

		export import Decorator = PackageCore.Decorator;

		enum Mode {
			VERTICAL,
			HORIZONTAL,
		}

	}

	export class Carousel extends PackageCore.Component {
		constructor(options?: Self.Carousel.Options);

		autoplay: boolean;

		delimiterIcon: Self.Carousel.DelimiterIcon;

		delimiterSize: Self.Carousel.DelimiterSize;

		interval: number;

		currentIndex: number;

		isPlaying: boolean;

		delimiterBackgroundTransparency: Self.Carousel.DelimiterBackgroundTransparency;

		showArrows: Self.Carousel.ShowArrows;

		showControlButton: Self.Carousel.ShowControlButton;

		buttonsType: Self.Carousel.ButtonsType;

		items: globalThis.Array<any>;

		showDelimiters: boolean;

		children: PackageCore.VDom.Children;

		animation: Self.Carousel.Animation;

		infinite: boolean;

		private renderItems(): void;

		private renderItem(): void;

		static getStyles(): void;

	}

	export namespace Carousel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			autoplay?: boolean;

			delimiterIcon?: Self.Carousel.DelimiterIcon;

			delimiterSize?: Self.Carousel.DelimiterSize;

			delimiterBackgroundTransparency?: Self.Carousel.DelimiterBackgroundTransparency;

			showDelimiters?: Self.Carousel.ShowDelimiters;

			interval?: number;

			showArrows?: Self.Carousel.ShowArrows;

			showControlButton?: Self.Carousel.ShowControlButton;

			buttonType?: Self.Carousel.ButtonsType;

			animation?: Self.Carousel.Animation;

			infinite?: boolean;

		}

		export import DelimiterIcon = Self.DelimiterConstant.Icon;

		export import DelimiterSize = Self.DelimiterConstant.Size;

		export import DelimiterBackgroundTransparency = Self.CarouselConstants.BackgroundTransparency;

		export import ShowArrows = Self.CarouselConstants.ShowArrows;

		export import ShowControlButton = Self.CarouselConstants.ShowArrows;

		export import ShowDelimiters = Self.CarouselConstants.ShowArrows;

		export import ButtonsType = Self.CarouselConstants.ButtonsType;

		export import Animation = Self.CarouselConstants.Animation;

		export import ButtonName = Self.CarouselConstants.ButtonName;

		export import I18N = Self.CarouselConstants.I18n;

	}

	namespace CarouselConstants {
		enum BackgroundTransparency {
			FULL,
			HIGH,
			MEDIUM,
			LOW,
		}

		enum ShowArrows {
			ALWAYS,
			HOVER,
			HIDDEN,
		}

		enum ButtonsType {
			DEFAULT,
			EMBEDDED,
		}

		enum Animation {
			NONE,
			SLIDE,
			FADE,
		}

		enum ButtonName {
			PREVIOUS,
			NEXT,
			AUTOPLAY,
		}

		enum I18n {
			GO_PREVIOUS,
			GO_NEXT,
			START_PLAY,
			PAUSE_PLAY,
		}

	}

	export class CarouselItem {
		static JsxComponent(props?: {children?: PackageCore.VDom.Children; currentIndex?: any; key?: any; animation?: Self.CarouselConstants.Animation}): PackageCore.JSX.Element;

	}

	export namespace CarouselItem {
	}

	export class CellField extends PackageCore.Component {
		constructor(options?: Self.CellField.Options);

		cell: Self.GridCell;

		value: any;

		editable: boolean;

		mandatory: boolean;

		size: Self.Field.Size;

		orientation: Self.Field.Orientation;

		offset: boolean;

		assistiveContent: (PackageCore.Component | PackageCore.JSX.Element);

		inline: boolean;

		fieldLevelHelp: (Self.Field.FieldLevelHelpCallback | Self.HelpService.FieldLevelHelpOptions | null);

		activate(): void;

		acceptChanges(): void;

		discardChanges(): void;

		setEditable(value: boolean): void;

	}

	export namespace CellField {
		interface Options extends PackageCore.Component.Options {
			cell: Self.GridCell;

			size?: Self.Field.Size;

			orientation?: Self.Field.Orientation;

			offset?: boolean;

			mandatory?: boolean;

			fieldLevelHelp?: (Self.Field.FieldLevelHelpCallback | Self.HelpService.FieldLevelHelpOptions);

			assistiveContent?: PackageCore.Component;

			acceptChangesOnFocusOut?: boolean;

			inline?: boolean;

		}

		export import Size = Self.Field.Size;

	}

	export class Chart extends PackageCore.Component {
		constructor(options?: Self.Chart.Options);

		definition: (object | null);

		highlightFunction: (((data: Self.Chart.PointData) => boolean) | null);

		legend: boolean;

		title: (null | string | number | PackageCore.Translation);

		pointTooltip: Self.Chart.Tooltip;

		type: Self.Chart.Type;

		series: globalThis.Array<Self.Chart.Series>;

		stacking: (Self.Chart.Stacking | null);

		subtitle: (null | string | number | PackageCore.Translation);

		xAxis: (Self.Chart.Axis | globalThis.Array<Self.Chart.Axis>);

		yAxis: (Self.Chart.Axis | globalThis.Array<Self.Chart.Axis>);

		update(definition: object): void;

		withRawHandle(callback: (chart: any) => void): void;

		redraw(): void;

	}

	export namespace Chart {
		interface PointData {
			x?: number;

			y?: number;

		}

		interface TooltipData {
			seriesName?: string;

			x?: number;

			y?: number;

		}

		interface Tooltip {
			enabled?: boolean;

			formatter?: (data: Self.Chart.TooltipData) => Self.Chart.TooltipData;

		}

		interface Label {
			formatter?: (label: string) => string;

		}

		interface PlotLine {
			value?: number;

			text?: (null | string | number | PackageCore.Translation);

		}

		interface Axis {
			title?: (null | string | number | PackageCore.Translation);

			categories?: (globalThis.Array<string> | globalThis.Array<number>);

			min?: number;

			max?: number;

			opposite?: boolean;

			label?: Self.Chart.Label;

			plotLines?: globalThis.Array<Self.Chart.PlotLine>;

		}

		interface Series {
			name?: (null | string | number | PackageCore.Translation);

			data?: globalThis.Array<number>;

			type?: Self.Chart.Type;

			connectNulls?: boolean;

			dataLabels?: boolean;

			yAxis?: number;

			xAxis?: number;

			stack?: string;

			lineType?: Self.Chart.SeriesLineType;

			symbol?: Self.Chart.SeriesSymbol;

			highlightFunction?: (data: Self.Chart.PointData) => boolean;

		}

		interface Options extends PackageCore.Component.Options {
			type?: Self.Chart.Type;

			title?: (null | string | number | PackageCore.Translation);

			subtitle?: (null | string | number | PackageCore.Translation);

			xAxis?: (Self.Chart.Axis | globalThis.Array<Self.Chart.Axis>);

			yAxis?: (Self.Chart.Axis | globalThis.Array<Self.Chart.Axis>);

			series?: globalThis.Array<Self.Chart.Series>;

			legend?: boolean;

			stacking?: Self.Chart.Stacking;

			pointTooltip?: Self.Chart.Tooltip;

			highlightFunction?: (data: Self.Chart.PointData) => boolean;

			definition?: object;

			modules?: globalThis.Array<Self.Chart.Module>;

		}

		enum Module {
			CORE,
			MORE,
			ACCESSIBILITY,
			ANNOTATIONS,
			ANNOTATIONS_ADVANCED,
			ARROW_SYMBOLS,
			BOOST,
			BOOST_CANVAS,
			BROKEN_AXIS,
			BULLET,
			COLORAXIS,
			CURRENT_DATE_INDICATOR,
			CYLINDER,
			DATA,
			DATAGROUPING,
			DEBUGGER,
			DEPENDENCY_WHEEL,
			DOTPLOT,
			DRAG_PANES,
			DRAGGABLE_POINTS,
			DRILLDOWN,
			DUMBBELL,
			EXPORT_DATA,
			EXPORTING,
			FULL_SCREEN,
			FUNNEL,
			FUNNEL3D,
			GANTT,
			GRID_AXIS,
			HEATMAP,
			HISTOGRAM_BELLCURVE,
			ITEM_SERIES,
			LOLLIPOP,
			MARKER_CLUSTERS,
			NETWORKGRAPH,
			NO_DATA_TO_DISPLAY,
			OFFLINE_EXPORTING,
			OLDIE,
			ORGANIZATION,
			OVERLAPPING_DATALABELS,
			PARALLEL_COORDINATES,
			PARETO,
			PATHFINDER,
			PATTERN_FILL,
			PRICE_INDICATOR,
			PYRAMID3D,
			SANKEY,
			SERIES_LABEL,
			SOLID_GAUGE,
			SONIFICATION,
			STATIC_SCALE,
			STOCK,
			STOCK_TOOLS,
			STREAMGRAPH,
			SUNBURST,
			TILEMAP,
			TIMELINE,
			TREEGRID,
			TREEMAP,
			VARIABLE_PIE,
			VARIWIDE,
			VECTOR,
			VENN,
			WINDBARB,
			WORDCLOUD,
			XRANGE,
		}

		enum Type {
			AREA,
			BAR,
			COLUMN,
			LINE,
			SPLINE,
		}

		enum Stacking {
			NORMAL,
			PERCENT,
		}

		enum SeriesSymbol {
			CIRCLE,
			SQUARE,
			DIAMOND,
			TRIANGLE,
			TRIANGLE_DOWN,
		}

		enum SeriesLineType {
			SOLID,
			DASH,
		}

		enum Color {
			ORANGE,
			PINK,
			PURPLE,
			BLUE_LIGHT,
			AZURE,
			BLUE,
			RED,
			BROWN,
			GREEN,
			GREEN_MOSS,
			YELLOW,
			BLACK,
		}

		enum ColorIndex {
		}

	}

	class ChartHandle {
	}

	namespace ChartHandle {
	}

	class ChartManager {
	}

	namespace ChartManager {
	}

	export class ChartPortlet extends PackageCore.Component {
		constructor(options?: Self.ChartPortlet.Options);

	}

	export namespace ChartPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class CheckBox extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.CheckBox.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | null);

		labelPosition: Self.CheckBox.LabelPosition;

		value: (boolean | null);

		defined: boolean;

		clickableLabel: boolean;

		emptyLabel: boolean;

		readOnly: boolean;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		empty: boolean;

		mandatory: boolean;

		nextValue: (Self.CheckBox.NextValueProvider | null);

		action: (Self.CheckBox.ActionCallback | null);

		setValue(value: (boolean | null), options?: {reason?: string}): void;

		setLabel(label: string): void;

		setLabelPosition(position: Self.CheckBox.LabelPosition): void;

		setReadOnly(value: boolean): void;

		toggle(options?: {reason?: string}): void;

		static Event: Self.CheckBox.EventTypes;

	}

	export namespace CheckBox {
		interface Options extends PackageCore.Component.Options {
			clickableLabel?: boolean;

			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			labelPosition?: Self.CheckBox.LabelPosition;

			readOnly?: boolean;

			value?: (boolean | null);

			nextValue?: Self.CheckBox.NextValueProvider;

			mandatory?: boolean;

			action?: Self.CheckBox.ActionCallback;

		}

		type ActionCallback = (args: Self.CheckBox.ActionArgs, sender: Self.CheckBox) => void;

		interface ActionArgs {
			value: (boolean | null);

			previousValue: (boolean | null);

			reason: string;

		}

		type NextValueProvider = (value: (boolean | null)) => (boolean | null);

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

		}

		export import Group = Self.CheckBoxGroup;

		export import Direction = Self.CheckBoxGroup.Direction;

		enum VisualStyle {
			CHECK,
		}

		enum LabelPosition {
			LEFT,
			RIGHT,
			ABOVE,
			BELOW,
		}

		enum Reason {
			CLICK,
			KEYPRESS,
		}

	}

	export class CheckBoxCell extends Self.GridCell {
		constructor(options?: object);

		checkBox: (Self.CheckBox | null);

		widgetOptions: (Self.CheckBox.Options | Self.GridCell.WidgetOptionsCallback<Self.CheckBox.Options>);

	}

	export namespace CheckBoxCell {
	}

	export class CheckBoxColumn extends Self.GridColumn {
		constructor(options: Self.CheckBoxColumn.Options);

		widgetOptions: (Self.CheckBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.CheckBox.Options> | null);

	}

	export namespace CheckBoxColumn {
		interface Options extends Self.GridColumn.Options {
			widgetOptions?: (Self.CheckBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.CheckBox.Options>);

		}

		export import Cell = Self.CheckBoxCell;

	}

	export class CheckBoxGroup extends PackageCore.Component {
		constructor(options?: Self.CheckBoxGroup.Options);

		content: PackageCore.Component;

		setContent(content: PackageCore.Component): void;

		children: PackageCore.VDom.Children;

		static getStyles(): void;

	}

	export namespace CheckBoxGroup {
		interface Options extends PackageCore.Component.Options {
			content?: PackageCore.Component;

			legend?: string;

			direction?: Self.CheckBoxGroup.Direction;

		}

		enum Direction {
			COLUMN,
			ROW,
		}

	}

	export class CheckBoxPicker extends Self.Picker {
		constructor(options?: Self.CheckBoxPicker.Options);

		checkBox: Self.CheckBox;

		private _handleSelectionChanged(args: Self.CheckBox.ActionArgs & {reason: string}): void;

	}

	export namespace CheckBoxPicker {
		interface Options extends PackageCore.Component.Options {
			checkBoxOptions: Self.CheckBox.Options;

		}

	}

	export class Code extends PackageCore.Component {
		constructor(options?: Self.Code.Options);

		children: PackageCore.VDom.Children;

		editable: boolean;

		content: string;

		setContent(content: string, options?: {reason?: string}): void;

		insertContent(content: string): void;

		static editor(options: Self.Code.Options): Self.Code;

		static Event: Self.Code.EventTypes;

	}

	export namespace Code {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: string;

			language?: Self.Code.Language;

			display?: Self.Code.Display;

			background?: Self.Code.Background;

			highlight?: boolean;

			editable?: boolean;

			showLIneNumbers?: boolean;

			lineWrapping?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			CONTENT_CHANGED: symbol;

		}

		enum Language {
			TEXT,
			JAVASCRIPT,
			CSS,
			HTML,
			JAVA,
		}

		enum Background {
			DEFAULT,
			THEME,
			SUCCESS,
			WARNING,
			ERROR,
			INFO,
		}

		enum Display {
			BLOCK,
			INLINE,
		}

		enum Reason {
			INPUT,
		}

	}

	export class ColorCanvas extends PackageCore.Component {
		constructor(options?: Self.ColorCanvas.Options);

		color: (PackageCore.Color | PackageCore.Color.HEX | null);

		mode: Self.ColorCanvas.Mode;

		size: Self.ColorCanvas.Size;

		withAlpha: boolean;

		setColor(hexOrColor: (PackageCore.Color | PackageCore.Color.HEX | null), args: {reason?: symbol}): void;

		setSize(newSize: Self.ColorCanvas.Size): void;

		setMode(newMode: Self.ColorCanvas.Mode): void;

		setWithAlpha(visible: boolean): void;

		private parseSize(): object;

		private getCurrentColor(): PackageCore.Color;

		private drawCanvas(): void;

		private drawIndicator(x: number, y: number): void;

		private drawSquareCanvas(context: object): void;

		private drawTriangleCanvas(context: object): void;

		private drawRainbowCanvas(context: object): void;

		private generateRainbowCanvasImageData(context: object): ImageData;

		private drawWheelCanvas(context: object): void;

		private generateWheelCanvasImageData(context: object): ImageData;

		private getIndicatorPosition(): (object | null);

		private getColorFromSquareCanvasPosition(x: number, y: number): PackageCore.Color;

		private getSquareCanvasIndicatorPosition(saturation: number, value: number): object;

		private getColorFromTriangleCanvasPosition(x: number, y: number): PackageCore.Color;

		private getTriangleCanvasIndicatorPosition(saturation: number, value: number): {x: number; y: number};

		private getColorFromRainbowCanvasPosition(x: number, y: number): PackageCore.Color;

		private getRainbowCanvasIndicatorPosition(hue: number, saturation: number): object;

		private getColorFromWheelCanvasPosition(x: number, y: number): PackageCore.Color;

		private getWheelCanvasIndicatorPosition(hue: number, saturation: number): object;

		private coordinatesToPolar(x: number, y: number, cX?: number, cY?: number): object;

		private radiansToDegrees(rad: number): number;

		private degreesToRadians(deg: number): number;

		private roundFloat(float: number): number;

		private limitValue(value: number, min: number, max: number): number;

		private isPointInTriangle(x: number, y: number): boolean;

		private handleClick(message: {position: {element: {x: number; y: number}}}, result: object): void;

		private createCanvas(): PackageCore.JSX.Element;

		private createSlider(): object;

		private createAlphaSlider(): object;

		static Event: Self.ColorCanvas.EventTypes;

	}

	export namespace ColorCanvas {
		interface Options extends PackageCore.Component.Options {
			color?: (PackageCore.Color | PackageCore.Color.HEX | null);

			mode?: Self.ColorCanvas.Mode;

			size?: Self.ColorCanvas.Size;

			withAlpha?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_COLOR_CHANGED: symbol;

		}

		enum Mode {
			SQUARE,
			TRIANGLE,
			WHEEL,
			RAINBOW,
			GRAYSCALE,
		}

		enum Reason {
			CALL,
			COLOR_SELECTED,
			UPDATE,
		}

		enum Source {
			CANVAS,
			GRAYSCALE_SLIDER,
			HUE_SLIDER,
			VALUE_SLIDER,
			ALPHA_SLIDER,
		}

		enum Size {
			SMALL,
			MEDIUM,
			LARGE,
		}

	}

	enum ColorComparator {
	}

	export class ColorModifier extends PackageCore.Component {
		constructor(options?: Self.ColorModifier.Options);

		color: (PackageCore.Color.HEX | PackageCore.Color | null);

		models: globalThis.Array<Self.ColorModifier.Model>;

		showTextBoxes: boolean;

		showSliders: boolean;

		setColor(value: (PackageCore.Color.HEX | PackageCore.Color | null), args?: {reason?: symbol; source?: any}): void;

		setModels(models: globalThis.Array<Self.ColorModifier.Model>): void;

		setTextBoxesVisibility(visibility: boolean): void;

		setSlidersVisibility(visibility: boolean): void;

		private createHexModifier(): Self.GridPanel;

		private handleHexChannelChange(_: any, options: {text: (string | null)}): void;

		private handleColorChannelChange(options: object): (PackageCore.Color | null);

		private createRgbModifier(): object;

		private createRgbChannelModifier(colorChannel: string, value: (string | null), text: string): object;

		private handleRgbChannelChange(colorChannel: string, newValue: (string | null)): (PackageCore.Color | null);

		private createCmykModifier(): object;

		private createCmykChannelModifier(colorChannel: string, value: (string | null), text: string): object;

		private handleCmykChannelChange(colorChannel: string, newValue: (string | null)): (PackageCore.Color | null);

		private createHslModifier(): object;

		private createHslChannelModifier(colorChannel: string, value: (string | null), text: string): object;

		private handleHslChannelChange(colorChannel: string, newValue: (string | null)): (PackageCore.Color | null);

		private createHsvModifier(): object;

		private createHsvChannelModifier(colorChannel: string, value: (string | null), text: string): object;

		private handleHsvChannelChange(colorChannel: string, newValue: (string | null)): (PackageCore.Color | null);

		private createHwbModifier(): object;

		private createHwbChannelModifier(colorChannel: string, value: (string | null), text: string): object;

		private handleHwbChannelChange(colorChannel: string, newValue: (string | null)): (PackageCore.Color | null);

		private createGrayscaleModifier(): object;

		private createAlphaModifier(): object;

		private createLabel(text: string): Self.Text;

		private createLabelId(model: string, channel: (string | null)): string;

		private createByteChannelTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.TextBox;

		private createDegreesChannelTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.TextBox;

		private createIntegerChannelTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string, maximum: number): Self.TextBox;

		private createFloatChannelTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.TextBox;

		private createHexTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.TextBox;

		private createTextBox(value: (string | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, type: Self.ColorModifier.TextBoxType, textValidator: Self.TextBox.TextValidatorCallback, keyValidator: Self.TextBox.KeyValidatorCallback, revertHandler: (((textBox: Self.TextBox) => void) | null), labelId: string): Self.TextBox;

		private createByteChannelSlider(value: (number | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.Slider;

		private createDegreesChannelSlider(value: (number | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.Slider;

		private createFloatChannelSlider(value: (number | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string): Self.Slider;

		private createSlider(value: (number | null), handler: (modifier: Self.ColorModifier.Modifier, args: object) => void, labelId: string, items: Self.Slider.ValuesObject): Self.Slider;

		private handleIntegerChannelChanged(value: (string | null), type: Self.ColorModifier.Model, colorModifier: (modifier: number) => (PackageCore.Color | null), modifier: Self.ColorModifier.Modifier, args: object, maximum: object): void;

		private getNewValueFromIntegerModifier(modifier: Self.ColorModifier.Modifier, args: object): (number | null);

		private handleByteChannelChanged(type: Self.ColorModifier.Model, colorModifier: (modifier: number) => (PackageCore.Color | null), modifier: Self.ColorModifier.Modifier, args: object): void;

		private handleDegreesChannelChanged(type: Self.ColorModifier.Model, colorModifier: (modifier: number) => (PackageCore.Color | null), modifier: Self.ColorModifier.Modifier, args: object): void;

		private handleFloatChannelChanged(type: Self.ColorModifier.Model, colorModifier: (modifier: number) => (PackageCore.Color | null), modifier: Self.ColorModifier.Modifier, args: object): void;

		private getNewValueFromFloatModifier(modifier: Self.ColorModifier.Modifier, args: object): (number | null);

		private createModifierGrid(items: globalThis.Array<object>, channelCount: number): object;

		private createModel(model: Self.ColorModifier.Model): object;

		static Event: Self.ColorModifier.EventTypes;

	}

	export namespace ColorModifier {
		interface Options extends PackageCore.Component.Options {
			color?: (PackageCore.Color.HEX | PackageCore.Color);

			models?: (globalThis.Array<Self.ColorModifier.Model>);

			orientation?: Self.ColorModifier.Orientation;

			modifierOrientation?: Self.ColorModifier.Orientation;

			showTextBoxes?: boolean;

			showSliders?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_COLOR_CHANGED: symbol;

		}

		enum Reason {
			CALL,
			SLIDER_UPDATE,
			TEXT_BOX_UPDATE,
		}

		enum Model {
			HEX,
			RGB,
			CMYK,
			HSL,
			HSV,
			HWB,
			GRAYSCALE,
			ALPHA,
		}

		enum TextBoxType {
			HEX,
			INTEGER,
			FLOAT,
		}

		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

		enum Modifier {
			SLIDER,
			TEXTBOX,
		}

	}

	export class ColorPalette extends PackageCore.Component {
		constructor(options?: Self.ColorPalette.Options);

		selectedColor: Self.ColorPalette.ColorValue;

		palettes: globalThis.Array<object>;

		palettesPanel: Self.AccordionPanel;

		setSelectedColor(color: Self.ColorPalette.ColorValue, args: {reason?: symbol}): void;

		private parsePalettes(palettes: globalThis.Array<any>): globalThis.Array<Self.ColorPalette.PaletteConfig>;

		private createPalette(palette: Self.ColorPalette.PaletteConfig, paletteIndex: number): Self.StackPanel;

		private createColor(paletteIndex: number, colorIndex: number): Self.ColorPaletteBox;

		private createAddButton(paletteIndex: number): Self.Button;

		private getAddButtonTooltipContent(selectedColorInPalette: boolean): PackageCore.Translation;

		private handleColorSelected(args: {color: Self.ColorPalette.ColorValue; selected: boolean; reason: symbol}): void;

		private handleColorDeleted(paletteIndex: number, colorIndex: number, args: {reason: Self.ColorPaletteBox.Reason}): void;

		private colorIsInPalette(color: PackageCore.Color, palette: Self.ColorPalette.PaletteConfig): object;

		private handleAddButtonClicked(paletteIndex: number): void;

		private focusColorBoxByDistance(distance: number): boolean;

		static Event: Self.ColorPalette.EventTypes;

	}

	export namespace ColorPalette {
		type ColorType = (null | PackageCore.Color.HEX | PackageCore.Color);

		type ColorValue = (undefined | Self.ColorPalette.ColorType);

		interface PaletteConfig {
			label?: (number | string | PackageCore.Translation);

			addButton?: boolean;

			deletable?: boolean;

			colors?: globalThis.Array<Self.ColorPalette.ColorType>;

			expanded?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			COLOR_SELECTED: symbol;

			SELECTED_COLOR_CHANGED: symbol;

			PALETTES_CHANGED: symbol;

			PALETTE_EXPANDED: symbol;

		}

		interface Options extends PackageCore.Component.Options {
			palettes?: globalThis.Array<Self.ColorPalette.PaletteConfig>;

			selectedColor?: Self.ColorPalette.ColorValue;

		}

		enum Reason {
			CALL,
			COLOR_SELECTED,
			COLOR_ADDED,
			COLOR_DELETED,
			UPDATE,
		}

		enum I18n {
			ADD_BUTTON_ENABLED,
			ADD_BUTTON_DISABLED,
			ADD_BUTTON_NO_COLOR_SELECTED,
		}

		enum Palette {
			NEUTRAL,
			COLOR_500,
			COLOR_100,
		}

	}

	export class ColorPaletteBox extends PackageCore.Component {
		constructor(options?: Self.ColorPaletteBox.Options);

		color: (PackageCore.Color | PackageCore.Color.HEX | null);

		selected: boolean;

		selectable: boolean;

		deletable: boolean;

		size: number;

		setColor(color: (PackageCore.Color | PackageCore.Color.HEX | null), args: {reason?: symbol}): void;

		setSelected(selected: boolean, args: {reason?: symbol}): void;

		setDeletable(deletable: boolean): void;

		delete(): void;

		private createColorClass(): globalThis.Array<PackageCore.Style>;

		private handleActivated(options: {reason: any}): void;

		static Event: Self.ColorPaletteBox.EventTypes;

	}

	export namespace ColorPaletteBox {
		interface Options extends PackageCore.Component.Options {
			color?: (PackageCore.Color | PackageCore.Color.HEX | null);

			selected?: boolean;

			selectable?: boolean;

			deletable?: boolean;

			size?: number;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			COLOR_SELECTED: symbol;

			COLOR_DELETED: symbol;

			COLOR_CHANGED: symbol;

			COLOR_ACTIVATED: symbol;

		}

		enum Reason {
			ENTER,
			DELETE,
			CLICK,
			CONTEXT_MENU,
			CALL,
		}

		enum I18n {
			DELETE,
			NO_COLOR,
		}

	}

	export class ColorPicker extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.ColorPicker.Options);

		color: (PackageCore.Color | PackageCore.Color.HEX | null);

		mode: Self.ColorPicker.Mode;

		displayType: Self.ColorPicker.DisplayType;

		empty: boolean;

		mandatory: boolean;

		opened: boolean;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		size: Self.ColorPicker.Size;

		onColorChanged: (Self.ColorPicker.ColorChangedCallback | null);

		setColor(value: Self.ColorPalette.ColorValue, args: {reason?: Self.ColorPicker.Reason}): void;

		setMandatory(newValue: boolean): void;

		setOpened(): void;

		openColorSelectorPicker(): void;

		closeColorSelectorPicker(): void;

		toggleColorSelectorPicker(): void;

		private createTextBox(): Self.TextBox;

		private colorToText(): string;

		private handleTextBoxTextAccepted(args: {reason: symbol}): void;

		private createIcon(): Self.Image;

		private createColorBox(): Self.ColorPaletteBox;

		private handleToggleClicked(): void;

		private createColorSelectorPicker(): Self.ColorSelectorPicker;

		private handleColorSelectorPickerSelectionChanged(args: {selectedItems: (PackageCore.Color | PackageCore.Color.HEX | null); source: symbol; reason: symbol}): void;

		static default(args: {options?: Self.ColorPicker.Options; customColors?: globalThis.Array<(PackageCore.Color | PackageCore.Color.HEX)>; withNull?: boolean}): Self.ColorPicker;

		static Default(props: Self.ColorPicker.Options & {customColors?: globalThis.Array<(PackageCore.Color | PackageCore.Color.HEX)>; withNull?: boolean}): PackageCore.JSX.Element;

		static withoutCustomColors(args: {options?: Self.ColorPicker.Options; withNull?: boolean}): Self.ColorPicker;

		static WithoutCustomColors(props: Self.ColorPicker.Options & {withNull?: boolean}): PackageCore.JSX.Element;

		static onlyPalette(args: {options?: Self.ColorPicker.Options; withNull?: boolean}): Self.ColorPicker;

		static OnlyPalette(props: Self.ColorPicker.Options & {withNull?: boolean}): PackageCore.JSX.Element;

		static Event: Self.ColorPicker.EventTypes;

		static createDefaultPaletteOptions(customColors?: globalThis.Array<(PackageCore.Color | PackageCore.Color.HEX)>): Self.ColorPalette.Options;

		static createPaletteOnlyPaletteOptions(): Self.ColorPalette.Options;

	}

	export namespace ColorPicker {
		interface Options extends PackageCore.Component.Options {
			color?: (PackageCore.Color | PackageCore.Color.HEX | null);

			colorSelector?: Self.ColorSelector.Options;

			displayType?: Self.ColorPicker.DisplayType;

			mandatory?: boolean;

			mode?: Self.ColorPicker.Mode;

			palettes?: globalThis.Array<Self.ColorPalette.PaletteConfig>;

			size?: Self.ColorPicker.Size;

			onColorChanged?: Self.ColorPicker.ColorChangedCallback;

		}

		type ColorChangedCallback = (args: Self.ColorPicker.ColorChangedArgs, sender: Self.ColorPicker) => void;

		interface ColorChangedArgs {
			color: (PackageCore.Color | null);

			previousColor: (PackageCore.Color | null);

			reason: Self.ColorPicker.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			COLOR_CHANGED: symbol;

		}

		enum DisplayType {
			INPUT,
			COLOR_SWATCH,
		}

		export import Mode = Self.ColorSelector.Mode;

		enum Reason {
			CALL,
			VALID_COLOR,
			INVALID_COLOR,
			TEXT_BOX,
		}

		enum VisualStyle {
			DEFAULT,
			REDWOOD_FIELD,
		}

		export import Palette = Self.ColorPalette.Palette;

		enum I18N {
			OPEN_SELECTION,
		}

		export import Size = Self.InputSize;

	}

	export class ColorSelector extends PackageCore.Component {
		constructor(options?: Self.ColorSelector.Options);

		color: (PackageCore.Color | PackageCore.Color.HEX | null);

		mode: Self.ColorSelector.Mode;

		collapseWithLastPalette: boolean;

		colorPalette: object;

		colorCanvas: object;

		colorModifier: object;

		colorPaletteComponent: Self.ColorPalette;

		colorCanvasComponent: Self.ColorCanvas;

		colorModifierComponent: Self.ColorModifier;

		onColorChanged: (Self.ColorSelector.ColorChangedCallback | null);

		setColor(value: (PackageCore.Color | PackageCore.Color.HEX | null), args: {reason?: string}): void;

		setMode(mode: Self.ColorSelector.Mode): void;

		setModifiersExpanded(expanded: boolean): void;

		private createColorPalette(): Self.ColorPalette;

		private createColorCanvas(): Self.ColorCanvas;

		private createColorModifier(): Self.ColorModifier;

		static createDefaultPaletteOptions(options?: (globalThis.Array<(PackageCore.Color | PackageCore.Color.HEX | null)> | {customColors: globalThis.Array<(PackageCore.Color | PackageCore.Color.HEX | null)>; withNull: boolean})): Self.ColorPalette.Options;

		static createPaletteOnlyPaletteOptions(options?: {withNull?: boolean}): Self.ColorPalette.Options;

		static Event: Self.ColorSelector.EventTypes;

	}

	export namespace ColorSelector {
		interface Options extends PackageCore.Component.Options {
			collapseWithLastPalette?: boolean;

			color?: (PackageCore.Color | PackageCore.Color.HEX | null);

			colorCanvas?: Self.ColorCanvas.Options;

			colorModifier?: Self.ColorModifier.Options;

			colorPalette?: Self.ColorPalette.Options;

			mode?: Self.ColorSelector.Mode;

			palettes?: globalThis.Array<Self.ColorPalette.PaletteConfig>;

			onColorChanged?: Self.ColorSelector.ColorChangedCallback;

		}

		type ColorChangedCallback = (args: Self.ColorSelector.ColorChangedArgs, sender: Self.ColorSelector) => void;

		interface ColorChangedArgs {
			color: (PackageCore.Color | null);

			previousColor: (PackageCore.Color | null);

			source: (Self.ColorSelector.Source | null);

			reason: (Self.ColorSelector.Reason | null);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			COLOR_SELECTED: symbol;

			SELECTED_COLOR_CHANGED: symbol;

			PALETTES_CHANGED: symbol;

		}

		enum Reason {
			CALL,
			COLOR_SELECTED,
			UPDATE,
		}

		enum Source {
			COLOR_PALETTE,
			COLOR_CANVAS,
			COLOR_MODIFIER,
		}

		enum Mode {
			PALETTE_ONLY,
			COMPLETE,
		}

		enum I18n {
			CUSTOM_COLORS,
			PREDEFINED_COLORS,
		}

		export import Canvas = Self.ColorCanvas;

		export import Palette = Self.ColorPalette;

		export import PaletteBox = Self.ColorPaletteBox;

		export import Modifier = Self.ColorModifier;

	}

	export class ColorSelectorPicker extends Self.Picker {
		constructor(options: Self.ColorSelectorPicker.Options);

		colorSelector: Self.ColorSelector;

		setColor(color: (PackageCore.Color | PackageCore.Color.HEX), options?: {modifiersExpanded: boolean; reason: symbol}): void;

		private _handleColorSelected(args: {selectedColor: PackageCore.Color; previousColor: PackageCore.Color; source: Self.ColorSelector.Source; reason: symbol}): void;

		private _handleSelectedColorChanged(args: Self.ColorSelector.ColorChangedArgs): void;

		private _handlePalettesChanged(args: object): void;

	}

	export namespace ColorSelectorPicker {
		interface Options extends Self.Picker.Options {
			colorSelector?: (Self.ColorSelector | Self.ColorSelector.Options);

		}

	}

	class ColumnHitMap {
	}

	namespace ColumnHitMap {
	}

	class ColumnResizer {
		constructor();

	}

	namespace ColumnResizer {
	}

	class ComponentParser {
		constructor();

		parseValue(value: {bundleId?: string; type?: string}): any;

	}

	namespace ComponentParser {
	}

	export class ContentPanel extends PackageCore.Component {
		constructor(options?: Self.ContentPanel.Options);

		content: (PackageCore.Component | PackageCore.JSX.Element | null);

		element: Self.ContentPanel.Element;

		horizontalAlignment: Self.ContentPanel.HorizontalAlignment;

		verticalAlignment: Self.ContentPanel.VerticalAlignment;

		outerGap: (Self.ContentPanel.GapSize | Self.ContentPanel.GapSizeObject);

		decorator: (PackageCore.Decorator | null);

		children: PackageCore.VDom.Children;

		setContent(content: (PackageCore.Component | null)): void;

		setHorizontalAlignment(value: Self.ContentPanel.HorizontalAlignment): void;

		setVerticalAlignment(value: Self.ContentPanel.VerticalAlignment): void;

		setOuterGap(value: Self.ContentPanel.GapSize): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

	}

	export namespace ContentPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (PackageCore.Component | PackageCore.JSX.Element);

			decorator?: PackageCore.Decorator;

			horizontalAlignment?: Self.ContentPanel.HorizontalAlignment;

			outerGap?: (Self.ContentPanel.GapSize | Self.ContentPanel.GapSizeObject);

			verticalAlignment?: Self.ContentPanel.VerticalAlignment;

			element?: Self.ContentPanel.Element;

		}

		interface GapSizeObject {
			top?: Self.ContentPanel.GapSize;

			bottom?: Self.ContentPanel.GapSize;

			start?: Self.ContentPanel.GapSize;

			end?: Self.ContentPanel.GapSize;

			horizontal?: Self.ContentPanel.GapSize;

			vertical?: Self.ContentPanel.GapSize;

		}

		enum HorizontalAlignment {
			START,
			END,
			CENTER,
			STRETCH,
		}

		enum VerticalAlignment {
			START,
			END,
			CENTER,
			STRETCH,
		}

		export import GapSize = Self.GapSize;

		export import Decorator = PackageCore.Decorator;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class ContextMenu {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options: Self.ContextMenu.Options);

		opened: boolean;

		menu: Self.Menu;

		window: Self.Window;

		owner: (PackageCore.Component | PackageCore.VDomRef);

		open(args?: object): void;

		close(reason?: string): void;

		static Event: Self.ContextMenu.EventTypes;

	}

	export namespace ContextMenu {
		interface Options {
			owner: (PackageCore.Component | PackageCore.VDomRef);

			items?: globalThis.Array<Self.MenuItem.ItemDefinition>;

			menu?: Self.Menu.Options;

			window?: Self.Window.Options;

			on?: PackageCore.EventSource.ListenerMap;

		}

		interface EventTypes {
			OPENED: string;

			CLOSED: string;

		}

	}

	export class Dashboard extends PackageCore.Component {
		constructor(options?: Self.Dashboard.Options);

		scroll(options: PackageCore.ScrollController.ScrollOptions): boolean;

	}

	export namespace Dashboard {
		type LayoutResponsive = Record<Self.Dashboard.Breakpoint, Self.Dashboard.LayoutItem>;

		interface LayoutItem {
			id: any;

			width: (number | Self.Dashboard.LayoutResponsiveSize);

			height: (number | Self.Dashboard.LayoutResponsiveSize);

		}

		type LayoutResponsiveSize = Record<Self.Dashboard.Breakpoint, number>;

		type LayoutFunction = (width: Self.Dashboard.Breakpoint) => globalThis.Array<Self.Dashboard.LayoutItem>;

		interface Portlet {
			id: any;

			type: any;

			content: any;

		}

		interface Options extends PackageCore.Component.Options {
			layout: (globalThis.Array<Self.Dashboard.LayoutItem> | Self.Dashboard.LayoutResponsive | Self.Dashboard.LayoutFunction);

			portlets: globalThis.Array<Self.Dashboard.Portlet>;

		}

		export import Breakpoint = Self.ResponsivePanel.Breakpoint;

	}

	export class DataGrid extends Self.DataSourceComponent {
		constructor(options?: Self.DataGrid.Options);

		columns: globalThis.Array<Self.GridColumn>;

		headerRows: globalThis.Array<Self.GridHeaderRow>;

		dataRows: globalThis.Array<Self.GridDataRow>;

		flatDataRows: globalThis.Array<Self.GridDataRow>;

		pageDataRows: globalThis.Array<Self.GridDataRow>;

		flatPageDataRows: globalThis.Array<Self.GridDataRow>;

		dirtyRows: globalThis.Array<Self.GridDataRow>;

		topRootColumn: Self.GridColumn;

		leftRootColumn: Self.GridColumn;

		leftColumns: globalThis.Array<Self.GridColumn>;

		bodyRootColumn: Self.GridColumn;

		bodyColumns: globalThis.Array<Self.GridColumn>;

		rightRootColumn: Self.GridColumn;

		rightColumns: globalThis.Array<Self.GridColumn>;

		sectionRootColumn: {left: Self.GridColumn; body: Self.GridColumn; right: Self.GridColumn; top: Self.GridColumn};

		showHeader: boolean;

		cursor: {cell: (Self.GridCell | null); row: (Self.GridRow | null); column: (Self.GridColumn | null)};

		cursorCell: (Self.GridCell | null);

		cursorRow: (Self.GridRow | null);

		rangeSelection: (Self.GridCellRange | null);

		columnStretch: boolean;

		resizableColumns: boolean;

		resizableRows: boolean;

		draggableColumns: boolean;

		draggableRows: boolean;

		editable: boolean;

		paging: boolean;

		pageSize: number;

		pageNumber: number;

		inputController: Self.GridInputController;

		inputMode: Self.DataGrid.InputMode;

		stickySegments: {left: boolean; right: boolean; header: boolean; footer: boolean};

		stickyScrollbars: {horizontal: boolean; vertical: boolean};

		virtualization: boolean;

		sortable: boolean;

		sortDirections: globalThis.Array<Self.DataGrid.ColumnSortDirection>;

		dataLoader: (Self.Loader | null);

		placeholder: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		actionBar: (PackageCore.Component | PackageCore.JSX.Element | null);

		actionBarHeight: (number | null);

		actionBarVisible: boolean;

		stickyActionBar: boolean;

		showStatusIcon: boolean;

		rowCursor: boolean;

		cellCursor: boolean;

		columnReorder: boolean;

		rowReorder: boolean;

		cursorVisibility: Self.DataGrid.CursorVisibility;

		bodyViewportSize: PackageCore.Scrollable.Size;

		bodyContentSize: PackageCore.Scrollable.Size;

		scrollOffset: {x: number; y: number};

		scrollability: PackageCore.Scrollable.Scrollability;

		highlightRowsOnHover: boolean;

		onSort: Self.DataGrid.SortCallback;

		addColumn(columnDefinition: (Self.DataGrid.ColumnDefinition | Self.GridColumn), options?: {index?: number; section?: Self.DataGrid.ColumnSection; parentColumn?: Self.GridColumn; reason?: string}): Self.GridColumn;

		removeColumn(columnId: (string | Self.GridColumn)): Self.GridColumn;

		moveColumn(columnId: (string | Self.GridColumn), options: {parentColumn?: Self.GridColumn; section?: Self.DataGrid.ColumnSection; index: number}): Self.GridColumn;

		getColumn(columnId: (string | Self.GridColumn)): (Self.GridColumn | null);

		clearColumns(): void;

		setColumns(columns: Self.DataGrid.ColumnConfiguration): void;

		setEditable(value: boolean): void;

		setSortable(value: boolean): void;

		setResizableColumns(value: boolean): void;

		setResizableRows(value: boolean): void;

		setDraggableColumns(value: boolean): void;

		setDraggableRows(value: boolean): void;

		setPaging(paging: boolean): void;

		setPageSize(pageSize: number): void;

		setPageNumber(pageNumber: number): void;

		setSortDirections(directions: globalThis.Array<Self.DataGrid.ColumnSortDirection>): void;

		setPlaceholder(placeholder: (string | PackageCore.Translation | PackageCore.Component)): void;

		setRowCursor(value: boolean): void;

		setCellCursor(value: boolean): void;

		setCursorVisibility(value: Self.DataGrid.CursorVisibility): void;

		createSyntheticRow(args?: Self.GridSyntheticRow.Options): Self.GridSyntheticRow;

		createSyntheticCell(args: Self.GridSyntheticCell.Options): Self.GridSyntheticCell;

		createDataCell(args: any): Self.GridCell;

		addSyntheticRow(row: Self.GridSyntheticRow, args: {masterRow?: Self.GridRow; section?: string; inside?: boolean; above?: boolean; order?: number}): Self.GridSyntheticRow;

		removeSyntheticRow(syntheticRow: Self.GridSyntheticRow): void;

		pinRow(row: Self.GridDataRow, section: Self.DataGrid.RowSection): void;

		moveCursorByOffset(args: {x?: number; y?: number; predicate?: (cell: Self.GridCell) => boolean; reason?: Self.DataGrid.CursorUpdateReason}): boolean;

		moveCursorToRow(row: Self.GridRow, options?: {reason?: string}): boolean;

		moveCursorToCell(cell: Self.GridCell, options?: {reason?: string}): boolean;

		setCursorCell(cell: Self.GridCell, args?: {scrollIntoView?: boolean; reason?: string}): boolean;

		resetCursor(args?: {reason?: string}): void;

		setRangeSelection(range: (Self.GridCellRange | null)): void;

		scrollTo(args: {cell?: Self.GridCell; column?: Self.GridColumn; row?: Self.GridRow; element?: Element}): void;

		autoSize(options?: {header?: boolean; body?: boolean; footer?: boolean; width?: boolean; height?: boolean}): void;

		autoSizeWidth(): void;

		autoSizeHeader(options: {width?: boolean; height?: object}): void;

		flushAutoSize(): void;

		stretchColumns(): void;

		rowForDataItem(dataItem: any): (Self.GridDataRow | null);

		cellForElement(element: Element): (Self.GridCell | null);

		cellForMessage(message: PackageCore.RoutedMessage): (Self.GridCell | null);

		refreshColumnCells(column: Self.GridColumn): void;

		reloadColumnCells(column: Self.GridColumn): void;

		visitColumns(callback: (column: Self.GridColumn) => (boolean | null)): void;

		visitRows(callback: (row: Self.GridRow) => void): void;

		visitSectionRows(section: Self.DataGrid.RowSection, callback: (row: Self.GridRow) => void): void;

		visitDataRows(callback: (row: Self.GridDataRow) => (boolean | null)): void;

		visitPageDataRows(callback: (row: Self.GridDataRow) => (boolean | null)): void;

		visitColumnCells(column: Self.GridColumn, callback: (cell: Self.GridCell) => void): void;

		visitColumnDataCells(column: Self.GridColumn, callback: (cell: Self.GridCell) => void): void;

		getPageDataRows(pageNumber: number): globalThis.Array<Self.GridDataRow>;

		findFirstCell(args: {predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		findLastCell(args: {predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		findCellByOffset(cell: Self.GridCell, args: {x?: number; y?: number; predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		findNextCell(cell: Self.GridCell, args: {direction?: number; predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		createOverlay(args: object): Self.GridOverlay;

		editCell(cell: Self.GridCell, activate: boolean, reason: Self.DataGrid.CursorUpdateReason): boolean;

		startEditing(cell: Self.GridCell, activate: boolean, reason: Self.DataGrid.CursorUpdateReason): void;

		closeEditing(focusGrid: boolean): void;

		acceptChanges(): void;

		discardChanges(): void;

		reload(): void;

		loadAll(): globalThis.Promise<any>;

		expandAll(): globalThis.Promise<any>;

		getRowSectionPhysicalSize(rowSection: Self.DataGrid.RowSection): number;

		getColumnSectionPhysicalSize(columnSection: Self.DataGrid.ColumnSection): number;

		protected createRowSet(): object;

		protected bindDataRow(args: {dataRow: Self.GridRow; dataStoreEntry: object}): void;

		private configureHeaderCells(overlapCells: globalThis.Map<any, any>, level: number, row: Self.GridRow, column: Self.GridColumn): Self.GridCell;

		private configureDataCells(row: Self.GridRow, column: Self.GridColumn): Self.GridCell;

		static Event: Self.DataGrid.EventTypes;

	}

	export namespace DataGrid {
		interface StretchStrategyOptions {
			ignoreMaxWidth?: boolean;

		}

		interface Options extends Self.DataSourceComponent.Options {
			actionBar?: (PackageCore.Component | PackageCore.JSX.Element);

			actionBarHeight?: number;

			actionBarVisible?: boolean;

			allowUnsort?: boolean;

			allowRangeSelection?: boolean;

			autoSize?: Self.DataGrid.SizingStrategy;

			autoSizeHeader?: boolean;

			bindingController?: Self.GridBindingController;

			cellCursor?: boolean;

			columnDragSource?: PackageCore.DataExchange.DragSourceProvider;

			columnReorder?: boolean;

			columns?: Self.DataGrid.ColumnConfiguration;

			columnStretch?: boolean;

			customizeHeaderRow?: Self.DataGrid.CustomizeHeaderRowCallback;

			customizeRow?: Self.DataGrid.CustomizeRowCallback;

			dataLoader?: (Self.Loader | null);

			dataRowHeight?: number;

			directWrite?: boolean;

			draggableColumns?: boolean;

			draggableRows?: boolean;

			editable?: boolean;

			headerContent?: Self.GridHeaderCell.ContentCallback;

			headerRowHeight?: number;

			inputController?: Self.GridInputController;

			editingMode?: Self.DataGrid.EditingMode;

			inputMode?: Self.DataGrid.InputMode;

			keepSelection?: boolean;

			maxViewportHeight?: number;

			maxViewportWidth?: number;

			multiColumnSort?: boolean;

			pageNumber?: number;

			pageSize?: number;

			paging?: boolean;

			placeholder?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			preload?: Self.DataGrid.Preload;

			resizableColumns?: boolean;

			resizableRows?: boolean;

			rowCursor?: boolean;

			highlightRowsOnHover?: boolean;

			rowDragSource?: PackageCore.DataExchange.DragSourceProvider;

			rowReorder?: boolean;

			showHeader?: boolean;

			showStatusIcon?: boolean;

			sortable?: boolean;

			stretchStrategy?: (((args: object) => void) | Self.DataGrid.StretchStrategyOptions);

			stripedRows?: boolean;

			virtualization?: boolean;

			defaultColumnOptions?: Partial<Self.GridColumn.Options>;

			cursorVisibility?: Self.DataGrid.CursorVisibility;

			beforeEditCell?: Self.GridSelectEditInputController.BeforeEditCellCallback;

			lockedLevels?: number;

			onSort?: Self.DataGrid.SortCallback;

		}

		type ColumnConfiguration = (globalThis.Array<Self.DataGrid.ColumnDefinition> | {left: globalThis.Array<Self.DataGrid.ColumnDefinition>; body: globalThis.Array<Self.DataGrid.ColumnDefinition>; right: globalThis.Array<Self.DataGrid.ColumnDefinition>});

		type SortCallback = (args: Self.DataGrid.SortArgs, sender: Self.DataGrid) => void;

		interface SortArgs {
			directions: globalThis.Array<Self.DataGrid.SortArg>;

			previousDirections: globalThis.Array<Self.DataGrid.SortArg>;

		}

		interface SortArg {
			column: Self.GridColumn;

			direction: Self.DataGrid.SortDirection;

		}

		type CustomizeHeaderRowCallback = (args: {index: number; row: Self.GridHeaderRow}) => void;

		type CustomizeRowCallback = (args: Self.DataGrid.CustomizeRowCallbackArgs) => void;

		interface CustomizeRowCallbackArgs {
			dataGrid: Self.DataGrid;

			row: Self.GridDataRow;

			dataItem: any;

			index: number;

			level: number;

		}

		type ColumnDefinition = (Self.ActionColumn.Options | Self.CheckBoxColumn.Options | Self.DatePickerColumn.Options | Self.DropdownColumn.Options | Self.GrabColumn.Options | Self.LinkColumn.Options | Self.MultiselectDropdownColumn.Options | Self.SelectionColumn.Options | Self.TemplatedColumn.Options | Self.TextAreaColumn.Options | Self.TextBoxColumn.Options | Self.TimePickerColumn.Options | Self.TreeColumn.Options);

		interface EventTypes extends Self.DataSourceComponent.EventTypes {
			ROW_UPDATE: string;

			COLUMN_UPDATE: string;

			CELL_UPDATE: string;

			ROW_SELECTION_CHANGED: string;

			CURSOR_UPDATED: string;

			SCROLLABILITY_CHANGED: string;

			SORT: string;

		}

		interface ColumnSortDirection {
			column: Self.GridColumn;

			direction: Self.DataGrid.SortDirection;

		}

		enum SizingStrategy {
			MANUAL,
			INITIAL_WIDTH,
		}

		export import RowSection = Self.GridConstants.RowSection;

		export import Row = Self.GridRow;

		export import HeaderRow = Self.GridMasterRow;

		export import MasterRow = Self.GridMasterRow;

		export import DataRow = Self.GridDataRow;

		export import SyntheticRow = Self.GridSyntheticRow;

		export import ColumnSection = Self.GridConstants.ColumnSection;

		export import ColumnType = Self.GridConstants.ColumnType;

		export import Column = Self.GridColumn;

		export import TextBoxColumn = Self.TextBoxColumn;

		export import TextAreaColumn = Self.TextAreaColumn;

		export import TreeColumn = Self.TreeColumn;

		export import DetailColumn = Self.TreeColumn;

		export import GrabColumn = Self.GrabColumn;

		export import CheckBoxColumn = Self.CheckBoxColumn;

		export import DropdownColumn = Self.DropdownColumn;

		export import MultiselectDropdownColumn = Self.MultiselectDropdownColumn;

		export import DatePickerColumn = Self.DatePickerColumn;

		export import TimePickerColumn = Self.TimePickerColumn;

		export import ActionColumn = Self.ActionColumn;

		export import TemplatedColumn = Self.TemplatedColumn;

		export import LinkColumn = Self.LinkColumn;

		export import SelectionColumn = Self.SelectionColumn;

		export import Cell = Self.GridCell;

		export import HeaderCell = Self.GridHeaderCell;

		export import SyntheticCell = Self.GridSyntheticCell;

		export import TextBoxCell = Self.TextBoxCell;

		export import TextAreaCell = Self.TextAreaCell;

		export import TreeCell = Self.TreeCell;

		export import GrabCell = Self.GrabCell;

		export import CheckBoxCell = Self.CheckBoxCell;

		export import DropdownCell = Self.DropdownCell;

		export import MultiselectDropdownCell = Self.MultiselectDropdownCell;

		export import DatePickerCell = Self.DatePickerCell;

		export import TimePickerCell = Self.TimePickerCell;

		export import ActionCell = Self.ActionCell;

		export import TemplatedCell = Self.TemplatedCell;

		export import LinkCell = Self.LinkCell;

		export import SelectionCell = Self.SelectionCell;

		export import DataExchange = Self.GridDataExchange;

		export import InputMode = Self.GridConstants.InputMode;

		enum EditingMode {
			CELL,
			ROW,
		}

		export import Selection = Self.GridSelection;

		export import SelectionStrategy = Self.GridSelectionStrategy;

		export import SingleSelection = Self.GridSingleSelection;

		export import SingleSelectionStrategy = Self.GridSingleSelectionStrategy;

		export import MultiSelection = Self.GridMultiSelection;

		export import MultiSelectionStrategy = Self.GridMultiSelectionStrategy;

		export import HelperButtonMode = Self.GridConstants.HelperButtonMode;

		export import SortDirection = Self.GridConstants.SortDirection;

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
		}

		enum RowUpdateReason {
			DATA_UNBIND,
			ITEM_ADDED,
			ITEM_REMOVED,
			ITEM_MOVED,
		}

		export import CursorUpdateReason = Self.GridConstants.CursorUpdateReason;

		enum SelectionUpdateReason {
			DATA_UNBIND,
			ROWS_REMOVED,
		}

		enum Preload {
			ALL,
			VISIBLE,
			NONE,
		}

		enum CursorVisibility {
			FOCUS,
			ALWAYS,
		}

		export import Reason = Self.DataSourceComponent.UnbindReason;

	}

	export abstract class DataSourceComponent extends PackageCore.Component {
		protected constructor(options?: Self.DataSourceComponent.Options);

		dataSource: PackageCore.DataSource;

		dataBound: boolean;

		bindingData: boolean;

		unbindingData: boolean;

		dataAccess: boolean;

		autoBind: boolean;

		showLoaderOnDataAccess: boolean;

		setDataSource(dataSource: (PackageCore.DataSource | null), options?: {reason?: string}): globalThis.Promise<any>;

		dataBind(): globalThis.Promise<any>;

		dataUnbind(): void;

		protected _onBindToDataSource(args: {dataSource: PackageCore.DataSource}): void;

		protected _onDataBound(args: {dataSource: PackageCore.DataSource}): void;

		protected _onUnbindFromDataSource(args: {dataSource: PackageCore.DataSource}): void;

		protected _onDataUnbound(args: {dataSource: PackageCore.DataSource}): void;

		protected _onDataSourceUpdated(update: {cause: PackageCore.DataSource.UpdateType; args: object}): void;

		protected _onDataAccessStarted(): void;

		protected _onDataAccessFinished(): void;

		static getValueMember(dataItem: object, valueMember: Self.DataSourceComponent.ValueMember): any;

		static getDisplayMember(dataItem: object, displayMember: Self.DataSourceComponent.DisplayMember): (PackageCore.Translation | string);

		static Event: Self.DataSourceComponent.EventTypes;

	}

	export namespace DataSourceComponent {
		interface Options extends PackageCore.Component.Options {
			showLoaderOnDataAccess?: boolean;

			autoBind?: boolean;

			dataSource?: PackageCore.DataSource;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			DATA_BOUND: string;

			DATA_UNBOUND: string;

			DATA_ACCESS_STARTED: string;

			DATA_ACCESS_FINISHED: string;

		}

		type DisplayMember = (string | Self.DataSourceComponent.DisplayMemberCallback);

		type ValueMember = (string | Self.DataSourceComponent.ValueMemberCallback);

		type DisplayMemberCallback = (dataItem: any) => any;

		type ValueMemberCallback = (dataItem: any) => any;

		enum UnbindReason {
			DATA_UNBIND,
			DISPOSE,
		}

	}

	export class DatePicker extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options: Self.DatePicker.Options);

		date: (PackageCore.Date | null);

		time: (PackageCore.Time | null);

		empty: boolean;

		mandatory: boolean;

		inputText: string;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		format: (string | null);

		formatter: (Self.DatePicker.FormatterCallback | null);

		parser: (Self.DatePicker.ParserCallback | null);

		startDate: (PackageCore.Date | null);

		endDate: (PackageCore.Date | null);

		viewDate: (PackageCore.Date | null);

		allowEmptyValue: boolean;

		comparator: (left: PackageCore.Date, right: PackageCore.Date) => number;

		datePickerOpened: boolean;

		timePickerOpened: boolean;

		calendar: Self.Calendar.Options;

		timePickerOptions: object;

		allowUserInput: boolean;

		firstDayOfWeek: number;

		showNextMonth: boolean;

		showPreviousMonth: boolean;

		showWeekNumbers: boolean;

		iconPosition: Self.DatePicker.IconPosition;

		placeholder: (string | null);

		size: Self.DatePicker.Size;

		onDateChanged: (Self.DatePicker.DateChangedCallback | null);

		acceptChanges(): void;

		setDate(date: (PackageCore.Date | null), options: {reason?: string; inputText?: string}): void;

		setInputText(text: string, options: {reason?: string; acceptChanges?: boolean}): void;

		setFormat(format: (string | null)): void;

		setFormatter(formatter: (((date: (PackageCore.Date | null)) => string) | null)): void;

		setParser(parser: (((text: string) => (PackageCore.Date | null)) | null)): void;

		setStartDate(date: (PackageCore.Date | null)): void;

		setEndDate(date: (PackageCore.Date | null)): void;

		setViewDate(date: (PackageCore.Date | null)): void;

		setAllowEmptyValue(value: boolean): void;

		openDatePicker(): boolean;

		closeDatePicker(): void;

		toggleDatePicker(): void;

		openTimePicker(): boolean;

		closeTimePicker(): void;

		toggleTimePicker(): void;

		selectAll(): void;

		dateEquals(left: (PackageCore.Date | null), right: (PackageCore.Date | null)): boolean;

		static Event: Self.DatePicker.EventTypes;

	}

	export namespace DatePicker {
		interface Options extends PackageCore.Component.Options {
			allowEmptyValue?: boolean;

			calendar?: Self.Calendar.Options;

			comparator?: Self.DatePicker.ComparatorCallback;

			validator?: Self.DatePicker.ValidatorCallback;

			date?: PackageCore.Date;

			datePickerType?: Self.Calendar.ViewType;

			endDate?: PackageCore.Date;

			firstDayOfWeek?: number;

			format?: string;

			formatter?: Self.DatePicker.FormatterCallback;

			iconPosition?: Self.DatePicker.IconPosition;

			parser?: Self.DatePicker.ParserCallback;

			placeholder?: (string | PackageCore.Translation);

			showNextMonth?: boolean;

			showPreviousMonth?: boolean;

			showWeekNumbers?: boolean;

			startDate?: PackageCore.Date;

			timeline?: object;

			withDatePicker?: boolean;

			withTimePicker?: boolean;

			mandatory?: boolean;

			allowUserInput?: boolean;

			timePickerOptions?: object;

			size?: Self.DatePicker.Size;

			onDateChanged?: Self.DatePicker.DateChangedCallback;

		}

		type DateChangedCallback = (args: Self.DatePicker.DateChangedArgs, sender: Self.DatePicker) => void;

		interface DateChangedArgs {
			date: (PackageCore.Date | null);

			previousDate: (PackageCore.Date | null);

			reason: Self.DatePicker.Reason;

		}

		type ComparatorCallback = (left: PackageCore.Date, right: PackageCore.Date) => number;

		type ValidatorCallback = (args: {empty: boolean; inputText: string; date: (PackageCore.Date | null)}) => void;

		type FormatterCallback = (date: (PackageCore.Date | null)) => string;

		type ParserCallback = (text: string) => (PackageCore.Date | null);

		interface EventTypes extends PackageCore.Component.EventTypes {
			DATE_CHANGED: string;

			INPUT_TEXT_CHANGED: string;

			INPUT_TEXT_ACCEPTED: string;

		}

		enum IconPosition {
			START,
			END,
		}

		enum Reason {
			AFTER,
			BEFORE,
			CLEAR,
			DATE_CHANGED,
			DATE_FORMATTED,
			DATE_PICKED,
			DISABLED,
			EMPTY,
			ENTER,
			INVALID_INPUT,
			PICKER_SELECTION_CHANGED,
			TEXT_CHANGED,
			TEXT_ACCEPTED,
			TIME_PICKED,
		}

		export import Size = Self.InputSize;

		enum I18N {
			OPEN_SELECTION,
		}

		export import DatePickerType = Self.Calendar.ViewType;

	}

	export class DatePickerCell extends Self.GridCell {
		constructor();

		format: string;

		formatter: (((data: (PackageCore.Date | null)) => string) | null);

		parser: (((text: string) => (PackageCore.Date | null)) | null);

		withTimePicker: boolean;

		datePicker: (Self.DatePicker | null);

		bindToText: boolean;

		widgetOptions: (Self.DatePicker.Options | Self.GridCell.WidgetOptionsCallback<Self.DatePicker.Options>);

	}

	export namespace DatePickerCell {
	}

	export class DatePickerColumn extends Self.GridColumn {
		constructor(options?: Self.DatePickerColumn.Options);

		format: (string | null);

		formatter: (Self.DatePicker.FormatterCallback | null);

		parser: (Self.DatePicker.ParserCallback | null);

		withTimePicker: boolean;

		bindToText: boolean;

		widgetOptions: (Self.DatePicker.Options | Self.GridColumn.WidgetOptionsCallback<Self.DatePicker.Options> | null);

		static defaultComparator(cell: Self.DatePickerCell, oldValue: (PackageCore.Date | string), newValue: (PackageCore.Date | string)): boolean;

	}

	export namespace DatePickerColumn {
		interface Options extends Self.GridColumn.Options {
			format?: string;

			formatter?: Self.DatePicker.FormatterCallback;

			parser?: Self.DatePicker.ParserCallback;

			withTimePicker?: boolean;

			bindToText?: boolean;

			widgetOptions?: (Self.DatePicker.Options | Self.GridColumn.WidgetOptionsCallback<Self.DatePicker.Options>);

		}

		export import Cell = Self.DatePickerCell;

	}

	export class DateRange extends PackageCore.Component {
		constructor(options?: Self.DateRange.Options);

		start: (Self.DatePicker | null);

		startRef: PackageCore.VDomRef;

		end: (Self.DatePicker | null);

		endRef: PackageCore.VDomRef;

		range: Self.DateRange.Range;

		rangeStart: (PackageCore.Date | null);

		rangeEnd: (PackageCore.Date | null);

		defaultInterval: (((date: PackageCore.Date) => PackageCore.Date) | null);

		inputOptions: Self.DatePicker.Options;

		startOptions: Self.DatePicker.Options;

		endOptions: Self.DatePicker.Options;

		onRangeChanged: (Self.DateRange.RangeChangedCallback | null);

		setRange(value: Self.DateRange.Range, options?: {reason?: string}): void;

		setRangeStart(startDate: (PackageCore.Date | null), options?: {reason?: string}): void;

		setRangeEnd(endDate: (PackageCore.Date | null), options?: {reason?: string}): void;

		static rangeEquals(left: (Self.DateRange.Range | null), right: (Self.DateRange.Range | null)): boolean;

		static Event: Self.DateRange.EventTypes;

	}

	export namespace DateRange {
		interface Options extends PackageCore.Component.Options {
			defaultInterval?: (date: PackageCore.Date) => PackageCore.Date;

			endOptions?: Self.DatePicker.Options;

			inputOptions?: Self.DatePicker.Options;

			range?: Self.DateRange.Range;

			startOptions?: Self.DatePicker.Options;

			startRef?: PackageCore.VDomRef;

			endRef?: PackageCore.VDomRef;

			onRangeChanged?: Self.DateRange.RangeChangedCallback;

		}

		interface Range {
			startDate: (PackageCore.Date | null);

			endDate: (PackageCore.Date | null);

		}

		type RangeChangedCallback = (args: Self.DateRange.RangeChangedArgs, sender: Self.DateRange) => void;

		interface RangeChangedArgs {
			range: (Self.DateRange.Range | null);

			previousRange: (Self.DateRange.Range | null);

			reason: Self.DateRange.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			RANGE_CHANGED: string;

		}

		enum Reason {
			DATE_CHANGED,
			INTERVAL,
		}

	}

	export class DateRangePicker extends Self.Picker {
		constructor(options: Self.DateRangePicker.Options);

		dateRange: Self.DateRange;

		private _handleRangeSelected(args: Self.DateRange.RangeChangedArgs): void;

	}

	export namespace DateRangePicker {
		interface Options extends Self.Picker.Options {
			dateRange?: Self.DateRange.Options;

		}

	}

	export class Delimiter extends PackageCore.Component {
		constructor(options?: Self.Delimiter.Options);

		icon: Self.Delimiter.Icon;

		size: Self.Delimiter.Size;

		selected: boolean;

		onClick: Function;

		index: number;

		static getStyles(): void;

	}

	export namespace Delimiter {
		interface Options extends PackageCore.Component.Options {
			icon?: Self.Delimiter.Icon;

			size?: Self.Delimiter.Size;

			selected?: boolean;

			onClick: Function;

			index?: number;

		}

		export import Icon = Self.DelimiterConstant.Icon;

		export import Size = Self.DelimiterConstant.Size;

		export import I18n = Self.DelimiterConstant.I18n;

	}

	namespace DelimiterConstant {
		enum Icon {
			CIRCLE,
			SQUARE,
			LINE,
		}

		enum Size {
			SMALL,
			MEDIUM,
			LARGE,
		}

		enum I18n {
			GO_TO,
		}

	}

	function DeprecationPanel(props: {classList: (string | PackageCore.Style | globalThis.Array<string> | globalThis.Array<PackageCore.Style>); children: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	export class Divider extends PackageCore.Component {
		constructor(options?: Self.Divider.Options);

		orientation: Self.Divider.Orientation;

		inset: Self.Divider.Inset;

		gap: Self.Divider.Gap;

		setOrientation(orientation: Self.Divider.Orientation): void;

		setInset(inset: Self.Divider.Inset): void;

		setGap(gap: Self.Divider.Gap): void;

		static Horizontal(props: Self.Divider.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.Divider.Options): PackageCore.JSX.Element;

		static getStyles(): void;

	}

	export namespace Divider {
		interface Options extends PackageCore.Component.Options {
			orientation?: Self.Divider.Orientation;

			inset?: Self.Divider.Inset;

			gap?: Self.Divider.Gap;

		}

		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

		enum Inset {
			NONE,
			START,
			END,
			BOTH,
		}

		enum Gap {
			NONE,
			START,
			END,
			BOTH,
		}

	}

	export class Dropdown extends Self.DataSourceComponent implements PackageCore.InputComponent {
		constructor(options: Self.Dropdown.Options);

		selectedItem: any;

		selectedIndex: number;

		selectedText: string;

		selectedValue: any;

		dropDownOpened: boolean;

		inputText: string;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		empty: boolean;

		mandatory: boolean;

		allowEmpty: boolean;

		picker: (Self.ListBoxPicker.Options | null);

		size: Self.Dropdown.Size;

		onSelectionChanged: (Self.Dropdown.SelectionChangedCallback | null);

		select(args: object): void;

		unselect(options?: {reason?: string}): void;

		openDropDown(args: object): void;

		closeDropDown(args?: object): void;

		toggleDropDown(args: object): void;

		acceptChanges(): void;

		setAllowEmpty(value: boolean): void;

		selectAll(): void;

		static Event: Self.Dropdown.EventTypes;

	}

	export namespace Dropdown {
		interface Options extends Self.DataSourceComponent.Options {
			acceptChangesOnFocusOut?: boolean;

			allowCustomItem?: boolean;

			allowCustomText?: boolean;

			allowEmpty?: boolean;

			autoSuggestOptions?: object;

			comparator?: Self.Dropdown.ComparatorCallback;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			filterable?: boolean;

			itemContent?: (item: Self.ListItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element);

			noDataMessage?: string;

			openDropDownOnClick?: boolean;

			openDropDownOnFocus?: boolean;

			picker?: Self.ListBoxPicker.Options;

			placeholder?: (string | PackageCore.Translation | PackageCore.Component);

			selectionContent?: (args: {selectedItem: any}) => PackageCore.JSX.Element;

			showLoaderOnDataAccess?: boolean;

			valueMember?: Self.DataSourceComponent.ValueMember;

			mandatory?: boolean;

			selectedItem?: any;

			selectedIndex?: number;

			selectedValue?: any;

			selectedText?: string;

			size?: Self.Dropdown.Size;

			onSelectionChanged?: Self.Dropdown.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.Dropdown.SelectionChangedArgs, sender: Self.Dropdown) => void;

		type ComparatorCallback = (left: any, right: any) => boolean;

		interface SelectionChangedArgs {
			item: any;

			previousItem: any;

			value: any;

			previousValue: any;

			text: any;

			previousText: any;

			index: (number | null);

			previousIndex: (number | null);

			reason: Self.Dropdown.Reason;

		}

		interface EventTypes extends Self.DataSourceComponent.EventTypes {
			SELECTED_ITEM_CHANGED: string;

			PICKER_OPENING: string;

			PICKER_OPENED: string;

			PICKER_CLOSING: string;

			PICKER_CLOSED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
			REDWOOD_FIELD,
		}

		enum Reason {
			CALL,
			UNSELECT,
			ACCEPT,
			SELECTION_CHANGED,
			AUTO_SUGGEST,
			CLICK,
			DATA_LOADED,
			DATA_SOURCE_UNBOUND,
			RELOAD,
			CLEAR,
			INPUT,
			KEY_ARROW_DOWN,
			KEY_ARROW_UP,
		}

		enum I18N {
			OPEN_SELECTION,
			NO_DATA_AVAILABLE,
		}

		export import Size = Self.InputSize;

	}

	export class DropdownCell extends Self.GridCell {
		constructor(options: object);

		dataSource: PackageCore.DataSource;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		valueMember: (Self.DataSourceComponent.ValueMember | null);

		bindToValue: boolean;

		valueDisplayMember: Self.DataSourceComponent.DisplayMember;

		dropdown: (Self.Dropdown | null);

		widgetOptions: (Self.Dropdown.Options | Self.GridCell.WidgetOptionsCallback<Self.Dropdown.Options>);

		setDataSource(dataSource: (PackageCore.DataSource | null)): void;

	}

	export namespace DropdownCell {
	}

	export class DropdownColumn extends Self.GridColumn {
		constructor(options: Self.DropdownColumn.Options);

		dataSource: (PackageCore.DataSource | null);

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		valueMember: (Self.DataSourceComponent.ValueMember | null);

		bindToValue: boolean;

		valueDisplayMember: (Self.DataSourceComponent.DisplayMember | null);

		widgetOptions: (Self.Dropdown.Options | Self.GridColumn.WidgetOptionsCallback<Self.Dropdown.Options> | null);

	}

	export namespace DropdownColumn {
		interface Options extends Self.GridColumn.Options {
			dataSource?: PackageCore.DataSource;

			valueMember?: Self.DataSourceComponent.ValueMember;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			bindToValue?: boolean;

			valueDisplayMember?: Self.DataSourceComponent.DisplayMember;

			widgetOptions?: (Self.Dropdown.Options | Self.GridColumn.WidgetOptionsCallback<Self.Dropdown.Options>);

			dataSourceConfigurator?: Self.DropdownColumn.DataSourceConfiguratorCallback;

		}

		type DataSourceConfiguratorCallback = (row: Self.GridDataRow) => (PackageCore.DataSource | null);

		export import Cell = Self.DropdownCell;

	}

	export class EllipsisTooltip {
		constructor(options?: Self.EllipsisTooltip.Options & {content?: (string | PackageCore.Component | PackageCore.JSX.Element)});

		shown: boolean;

		attach(args: object): void;

		detach(): void;

		show(): void;

		hide(): void;

		private getComponents(): void;

	}

	export namespace EllipsisTooltip {
		interface Options {
			content: any;

		}

	}

	export class Favorite extends PackageCore.Component {
		constructor(options?: Self.Favorite.Options);

		value: boolean;

		icon: Self.Favorite.Icon;

		size: Self.Favorite.Size;

		color: Self.Favorite.Color;

		onToggled: (Self.Favorite.ToggledCallback | null);

		setValue(value: boolean, args?: {reason?: (symbol | string)}): void;

		toggle(args?: {reason?: (symbol | string)}): void;

		static Event: Self.Favorite.EventTypes;

	}

	export namespace Favorite {
		interface Options extends PackageCore.Component.Options {
			value?: boolean;

			icon?: Self.Favorite.Icon;

			size?: Self.Favorite.Size;

			color?: Self.Favorite.Color;

			onToggled?: Self.Favorite.ToggledCallback;

		}

		type ToggledCallback = (args: Self.Favorite.ToggledArgs, sender: Self.Favorite) => void;

		interface ToggledArgs {
			value: boolean;

			previousValue: boolean;

			reason: Self.Favorite.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

		}

		enum Icon {
			STAR,
			HEART,
		}

		enum Size {
			SMALL,
			DEFAULT,
			LARGE,
		}

		enum Color {
			DEFAULT,
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			ERROR,
			THEMED,
		}

		enum Reason {
			ENTER,
			SPACE,
			ESCAPE,
			CLICK,
			CALL,
		}

	}

	export class Field extends PackageCore.Component {
		constructor(options?: Self.Field.Options);

		inline: boolean;

		label: (string | number | PackageCore.Translation | null);

		control: (PackageCore.Component | PackageCore.JSX.Element | Self.Field.ControlOptions | null);

		children: PackageCore.VDom.Children;

		activeControl: (PackageCore.Component | PackageCore.JSX.Element);

		assistiveContent: (PackageCore.Component | PackageCore.JSX.Element);

		mode: Self.Field.Mode;

		mandatory: boolean;

		infoIcons: globalThis.Array<(Self.Image | PackageCore.JSX.Element)>;

		helperButtons: globalThis.Array<Self.Field.ButtonOption>;

		size: Self.Field.Size;

		offset: boolean;

		orientation: Self.Field.Orientation;

		labelJustification: Self.Field.LabelJustification;

		labelWrap: (boolean | number);

		fieldLevelHelp: (Self.Field.FieldLevelHelpCallback | Self.HelpService.FieldLevelHelpOptions);

		bloom: boolean;

		setInline(value: boolean): void;

		setLabel(value: (string | number | PackageCore.Translation)): void;

		setControl(value: (PackageCore.Component | PackageCore.JSX.Element | Self.Field.ControlOptions)): void;

		setAssistiveContent(value: (PackageCore.Component | PackageCore.JSX.Element)): void;

		setMode(value: Self.Field.Mode): void;

		setMandatory(value: boolean): void;

		setInfoIcons(value: globalThis.Array<(Self.Image | PackageCore.JSX.Element)>): void;

		setHelperButtons(buttons: globalThis.Array<Self.Field.ButtonOption>): void;

		clearStatus(): void;

		success(message: (string | PackageCore.Translation | PackageCore.Component)): void;

		info(message: (string | PackageCore.Translation | PackageCore.Component)): void;

		warning(message: (string | PackageCore.Translation | PackageCore.Component)): void;

		error(message: (string | PackageCore.Translation | PackageCore.Component)): void;

		pending(message: (string | PackageCore.Translation | PackageCore.Component)): void;

		setSize(size: Self.Field.Size): void;

		setOffset(offset: boolean): void;

		setOrientation(value: Self.Field.Orientation): void;

		setLabelJustification(value: Self.Field.LabelJustification): void;

		protected _selectControlByMode(mode: Self.Field.Mode): (PackageCore.Component | PackageCore.JSX.Element | Self.Field.ControlOptions | null);

		protected _onControlChange(): void;

		static Horizontal(props: Self.Field.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.Field.Options): PackageCore.JSX.Element;

		static Inline(props: Self.Field.Options): PackageCore.JSX.Element;

		static Event: Self.Field.EventTypes;

	}

	export namespace Field {
		interface ControlOptions {
			editable: PackageCore.Component;

			readOnly: PackageCore.Component;

		}

		interface ButtonOption {
			icon: Self.Image.Source;

			label: (string | PackageCore.Translation);

			action: () => void;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			label?: (string | number | PackageCore.Translation);

			control?: (PackageCore.Component | PackageCore.JSX.Element | Self.Field.ControlOptions);

			assistiveContent?: (PackageCore.Component | PackageCore.JSX.Element);

			mode?: Self.Field.Mode;

			mandatory?: boolean;

			infoIcons?: globalThis.Array<(Self.Image | PackageCore.JSX.Element)>;

			helperButtons?: globalThis.Array<Self.Field.ButtonOption>;

			fieldLevelHelp?: (Self.Field.FieldLevelHelpCallback | Self.HelpService.FieldLevelHelpOptions);

			size?: Self.Field.Size;

			offset?: boolean;

			orientation?: Self.Field.Orientation;

			labelJustification?: Self.Field.LabelJustification;

			labelWrap?: (boolean | number);

			inline?: boolean;

			bloom?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			MODE_CHANGED: string;

		}

		type FieldLevelHelpCallback = (label: Self.Label) => void;

		enum Mode {
			EDIT,
			VIEW,
		}

		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

		enum LabelJustification {
			START,
			END,
		}

		enum Size {
			AUTO,
			SMALL,
			MEDIUM,
			LARGE,
			XLARGE,
			XXLARGE,
			STRETCH,
		}

		export import Status = PackageCore.Component.Status;

		enum VisualStyle {
			DEFAULT,
		}

	}

	export class FieldGroup extends PackageCore.Component {
		constructor(options?: Self.FieldGroup.Options);

		content: (PackageCore.JSX.Element | PackageCore.Component);

		children: PackageCore.VDom.Children;

		title: (string | number | PackageCore.Translation | null);

		titleControls: ((PackageCore.Component | PackageCore.VDom.Element) | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)> | null);

		color: Self.FieldGroup.Color;

		collapsed: boolean;

		collapsible: boolean;

		onExpanded: Self.FieldGroup.ExpandedCallback;

	}

	export namespace FieldGroup {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			title: (string | number | PackageCore.Translation);

			titleControls?: ((PackageCore.Component | PackageCore.VDom.Element) | globalThis.Array<(PackageCore.Component | PackageCore.VDom.Element)>);

			color?: Self.FieldGroup.Color;

			collapsible?: boolean;

			collapsed?: boolean;

			onExpanded?: Self.FieldGroup.ExpandedCallback;

		}

		type ExpandedCallback = (args: Self.FieldGroup.ExpandedCallbackArgs) => void;

		interface ExpandedCallbackArgs {
			expanded: boolean;

		}

		enum Color {
			THEMED,
			NEUTRAL,
		}

	}

	namespace FieldOptions {
	}

	export class FilePicker extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.FilePicker.Options);

		fileTypes: globalThis.Array<string>;

		multiSelect: boolean;

		tooltipEnabled: boolean;

		emptyText: string;

		labelText: (Self.FilePicker.LabelTextCallback | null);

		valueValidator: (Self.FilePicker.ValueValidatorCallback | null);

		acceptInvalidValue: boolean;

		buttonPosition: Self.FilePicker.ButtonPosition;

		buttonOptions: Self.Button.Options;

		clearButton: boolean;

		selectedFiles: globalThis.Array<File>;

		empty: boolean;

		mandatory: boolean;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		messageTimeout: number;

		onFilesChanged: (Self.FilePicker.FilesChangedCallback | null);

		setSelectedFiles(files: globalThis.Array<File>, options?: {validate?: boolean; showValidationMessage?: boolean; reason?: string}): globalThis.Promise<void>;

		setFileTypes(value: globalThis.Array<string>): void;

		setMultiSelect(value: boolean): void;

		setTooltipEnabled(value: boolean): void;

		setButtonOptions(options: Self.Button.Options): void;

		setButtonPosition(value: Self.FilePicker.ButtonPosition): void;

		setEmptyText(value: (string | PackageCore.Translation)): void;

		setLabel(value: (files: globalThis.Array<File>) => string): void;

		setValueValidator(value: (Self.FilePicker.ValueValidatorCallback | null)): void;

		setAcceptInvalidValue(value: boolean): void;

		setMandatory(value: boolean): void;

		open(): void;

		clear(options?: {reason?: string}): void;

		private validate(files: globalThis.Array<File>, options?: {showMessage?: boolean}): (globalThis.Promise<boolean> | boolean);

		private renderInput(): void;

		private renderButton(): void;

		private renderClearButton(): void;

		static Event: Self.FilePicker.EventTypes;

	}

	export namespace FilePicker {
		interface Options extends PackageCore.Component.Options {
			selectedFiles?: globalThis.Array<File>;

			acceptInvalidValue?: boolean;

			buttonOptions?: Self.Button.Options;

			buttonPosition?: Self.FilePicker.ButtonPosition;

			clearButton?: boolean;

			emptyText?: (string | PackageCore.Translation);

			fileTypes?: globalThis.Array<string>;

			labelText?: Self.FilePicker.LabelTextCallback;

			messageTimeout?: number;

			multiSelect?: boolean;

			tooltipEnabled?: boolean;

			valueValidator?: Self.FilePicker.ValueValidatorCallback;

			mandatory?: boolean;

			onFilesChanged?: Self.FilePicker.FilesChangedCallback;

		}

		type FilesChangedCallback = (args: Self.FilePicker.FilesChangedArgs, sender: Self.FilePicker) => void;

		interface FilesChangedArgs {
			files: globalThis.Array<File>;

			previousFiles: globalThis.Array<File>;

			reason: Self.FilePicker.ChangeReason;

		}

		type ValueValidatorCallback = (previousFiles: globalThis.Array<File>, newFiles: globalThis.Array<File>) => (globalThis.Promise<(boolean | Self.FilePicker.ValidationResult)> | Self.FilePicker.ValidationResult | boolean);

		interface ValidationResult {
			valid: boolean;

			message: string;

		}

		type LabelTextCallback = (files: globalThis.Array<File>) => (string | PackageCore.Translation);

		interface EventTypes extends PackageCore.Component.EventTypes {
			FILES_CHANGED: string;

		}

		enum FileType {
			AUDIO,
			VIDEO,
			IMAGE,
			MEDIA,
		}

		enum ButtonPosition {
			START,
			END,
		}

		enum OpenReason {
			OPEN_CALL,
			BUTTON_CLICK,
		}

		enum ChangeReason {
			SELECT,
			DROP,
			CLEAR_BUTTON,
			CLEAR_CALL,
		}

		enum I18N {
			BUTTON_LABEL_STANDARD,
			BUTTON_LABEL_UPLOADING,
			LABEL_EMPTY,
			LABEL_FILE_NOT_ACCEPTED,
			LABEL_FILE_ATTACHED,
			LABEL_0_FILES_SELECTED,
			LABEL_FILETYPE_NOT_SUPPORTED,
		}

	}

	export class FilterChip extends PackageCore.Component {
		constructor(options: Self.FilterChip.Options);

		selectedValue: any;

		acceptedValue: any;

		label: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		valueFormatter: (Self.FilterChip.ValueFormatterCallback | string);

		valueComparator: Self.FilterChip.ValueComparatorCallback;

		picker: (Self.Picker | null);

		size: Self.FilterChip.Size;

		pickerOpened: boolean;

		emptyValue: any;

		activated: boolean;

		onValueChanged: (Self.FilterChip.ValueChangedCallback | null);

		onValueAccepted: (Self.FilterChip.ValueAcceptedCallback | null);

		setSelectedValue(value: any, options?: {reason?: symbol; accept?: boolean}): void;

		clear(options?: {reason?: symbol}): boolean;

		setSize(value: Self.FilterChip.Size): void;

		openPicker(args?: object): void;

		closePicker(args?: object): void;

		togglePicker(args?: object): void;

		private renderValuePanel(): PackageCore.JSX.Element;

		private renderSeparator(): PackageCore.JSX.Element;

		private renderValue(selectedValue: any): (PackageCore.Component | PackageCore.JSX.Element);

		private renderValueFromString(text: string): PackageCore.JSX.Element;

		private renderClearButton(): PackageCore.JSX.Element;

		private renderLabel(): PackageCore.JSX.Element;

		private createPicker(definition: Self.FilterChip.PickerCallback): Self.Picker;

		private assignDescribedByProperty(): void;

		private handlePickerOpened(args: object): void;

		private handlePickerClosed(args?: object): void;

		private handlePickerUpdated(): void;

		private isActivated(): boolean;

		static defaultValueComparator(selectedValue: any, emptyValue: any, filterChip: Self.FilterChip): boolean;

		static defaultPicker(options: Self.FilterChipPicker.Options): Self.FilterChip.PickerCallback;

		static singlePicker(options: Self.RadioGroupPicker.Options): Self.FilterChip.PickerCallback;

		static defaultValueFormatter(options?: Self.FilterChip.DefaultValueFormatterOptions): Self.FilterChip.ValueFormatterCallback;

		static Custom(props: Self.FilterChip.Options): PackageCore.JSX.Element;

		static default(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions: Self.FilterChipPicker.Options, valueFormatterOptions?: Self.FilterChip.DefaultValueFormatterOptions): Self.FilterChip;

		static Default(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.FilterChipPicker.Options; valueFormatterOptions?: Self.FilterChip.DefaultValueFormatterOptions}): PackageCore.JSX.Element;

		static single(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions: Self.RadioGroupPicker.Options, valueFormatterOptions?: Self.FilterChip.DefaultValueFormatterOptions): Self.FilterChip;

		static Single(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.RadioGroupPicker.Options; valueFormatterOptions?: Self.FilterChip.DefaultValueFormatterOptions}): PackageCore.JSX.Element;

		static Multi(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.FilterChipPicker.Options; valueFormatterOptions?: Self.FilterChip.DefaultValueFormatterOptions}): PackageCore.JSX.Element;

		static datePicker(options?: Self.CalendarPicker.Options): Self.FilterChip.PickerCallback;

		static dateValueFormatter(formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip.ValueFormatterCallback;

		static date(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: Self.CalendarPicker.Options, formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip;

		static Date(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.CalendarPicker.Options; formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)}): PackageCore.JSX.Element;

		static dateRangePicker(options?: Self.DateRangePicker.Options): Self.FilterChip.PickerCallback;

		static dateRangeValueFormatter(formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip.ValueFormatterCallback;

		static dateRange(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: Self.DateRangePicker.Options, formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip;

		static DateRange(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.DateRangePicker.Options; formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)}): PackageCore.JSX.Element;

		static timePicker(options?: Self.TimeSelectorPicker.Options): Self.FilterChip.PickerCallback;

		static timeValueFormatter(formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip.ValueFormatterCallback;

		static time(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: Self.TimeSelectorPicker.Options, formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip;

		static Time(props: Self.FilterChip.FactoryOptions & {pickerOptions?: Self.TimeSelectorPicker.Options; formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)}): PackageCore.JSX.Element;

		static timeRangePicker(options?: object): Self.FilterChip.PickerCallback;

		static timeRangeValueFormatter(formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip.ValueFormatterCallback;

		static timeRange(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: object, formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)): Self.FilterChip;

		static TimeRange(props: Self.FilterChip.FactoryOptions & {pickerOptions?: object; formatOrFormatter?: (string | Self.FilterChip.FormatterCallback)}): PackageCore.JSX.Element;

		static textBoxPicker(options?: object): Self.FilterChip.PickerCallback;

		static textBoxValueFormatter(): Self.FilterChip.ValueFormatterCallback;

		static textBox(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: object): Self.FilterChip;

		static TextBox(props: Self.FilterChip.FactoryOptions & {pickerOptions?: object}): PackageCore.JSX.Element;

		static checkBoxPicker(options?: object): Self.FilterChip.PickerCallback;

		static checkBoxValueFormatter(): Self.FilterChip.ValueFormatterCallback;

		static checkBox(filterChipOptions: Self.FilterChip.FactoryOptions, pickerOptions?: object): Self.FilterChip;

		static CheckBox(props: Self.FilterChip.FactoryOptions & {pickerOptions?: object}): PackageCore.JSX.Element;

		static toggle(filterChipOptions: Self.FilterChip.FactoryOptions): Self.FilterChip;

		static Toggle(props: Self.FilterChip.FactoryOptions): PackageCore.JSX.Element;

		static Event: Self.FilterChip.EventTypes;

		static DEFAULT_PICKER_OPTIONS: object;

	}

	export namespace FilterChip {
		type ValueComparatorCallback = (selectedValue: any, emptyValue: any, filterChip: Self.FilterChip) => boolean;

		type PickerCallback = (filterChip: Self.FilterChip) => Self.Picker;

		type ValueFormatterCallback = (selectedValue: any, filterChip: Self.FilterChip) => globalThis.Promise<(string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)>;

		type FormatterCallback = (value: any, filterChip: Self.FilterChip, formatService: PackageCore.FormatService) => (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		interface Options extends PackageCore.Component.Options {
			emptyValue?: any;

			valueComparator?: Self.FilterChip.ValueComparatorCallback;

			label: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			picker: Self.FilterChip.PickerCallback;

			selectedValue?: any;

			size?: Self.FilterChip.Size;

			valueFormatter?: (Self.FilterChip.ValueFormatterCallback | string);

			multiselectable?: boolean;

			role?: PackageCore.AriaRole;

			onValueChanged?: Self.FilterChip.ValueChangedCallback;

			onValueAccepted?: Self.FilterChip.ValueAcceptedCallback;

		}

		interface FactoryOptions extends PackageCore.Component.Options {
			emptyValue?: any;

			valueComparator?: Self.FilterChip.ValueComparatorCallback;

			label: (string | PackageCore.Component | PackageCore.Translation);

			selectedValue?: any;

			size?: Self.FilterChip.Size;

		}

		type ValueChangedCallback = (args: Self.FilterChip.ValueChangedArgs, sender: Self.FilterChip) => void;

		interface ValueChangedArgs {
			value: any;

			previousValue: any;

			reason: Self.FilterChip.Reason;

		}

		type ValueAcceptedCallback = (args: Self.FilterChip.ValueAcceptedArgs, sender: Self.FilterChip) => void;

		interface ValueAcceptedArgs {
			value: any;

			previousValue: any;

			reason: Self.FilterChip.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_VALUE_CHANGED: string;

			SELECTED_VALUE_ACCEPTED: string;

			ACTIVATED_STATE_CHANGED: string;

			PICKER_OPENING: string;

			PICKER_OPENED: string;

			PICKER_CLOSING: string;

			PICKER_CLOSED: string;

		}

		interface DefaultValueFormatterOptions {
			displayMember?: Self.DataSourceComponent.DisplayMember;

			valueMember?: Self.DataSourceComponent.ValueMember;

		}

		enum Reason {
			CALL,
			CLEAR,
			CLEAR_BUTTON,
			CLEAR_KEY,
			PICKER,
			PICKER_UPDATE,
			CLICK,
			KEY_ARROW_DOWN,
			KEY_ARROW_UP,
			KEY_ESCAPE,
			KEY_ENTER,
		}

		enum Size {
			SMALL,
			MEDIUM,
		}

		enum I18n {
			ALL,
			CLEAR_FILTER,
			CHECKBOX_YES,
			CHECKBOX_NO,
		}

	}

	export class FilterChipPicker extends Self.Picker {
		constructor(options: Self.FilterChipPicker.Options);

		dataSource: (PackageCore.DataSource | null);

		listBox: Self.ListBox;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		valueMember: (Self.DataSourceComponent.ValueMember | null);

		searchMember: (Self.DataSourceComponent.ValueMember | null);

		private handleSelectionChanged(args: Self.ListBox.SelectionChangedArgs): void;

		private handleListItemClicked(args: {buttons: object}): void;

		private handleListCursorMoved(args: {currentItem: PackageCore.Component}): void;

		private forwardMessageToList(message: PackageCore.RoutedMessage, result: object): void;

	}

	export namespace FilterChipPicker {
		interface Options extends Self.Picker.Options {
			dataSource?: PackageCore.DataSource;

			listBox?: Self.ListBox.Options;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			valueMember?: Self.DataSourceComponent.ValueMember;

			searchMember?: Self.DataSourceComponent.ValueMember;

			comparator?: (left: any, right: any) => boolean;

			search?: (boolean | Self.FilterChipPicker.SearchSettings | Self.FilterChipPicker.SearchPredicate);

		}

		type SearchPredicate = (item: any, string: string) => boolean;

		interface SearchSettings {
			predicate?: Self.FilterChipPicker.SearchPredicate;

			textBox?: Self.TextBox.Options;

		}

	}

	/**
	 * @deprecated Replaced by ListView.Filter JSX
	 */
	export namespace FilterFactory {
		type FilterPredicateCallback = (item: any, value: any) => boolean;

		interface Filter {
			id: any;

			filterPredicate: Self.FilterFactory.FilterPredicateCallback;

			filterChip: Self.FilterChip;

		}

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createCheckBoxFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); binding?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: boolean}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createToggleFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); binding?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: boolean}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createTextBoxFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); binding?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: string; matchingOperator?: Self.FilterFactory.TextBoxMatchingOperator}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createDropdownFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); dataProvider: () => PackageCore.DataSource; valueMember: string; displayMember: string; binding?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: any}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createMultiselectDropdownFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); dataProvider: () => PackageCore.DataSource; valueMember: string; displayMember: string; binding?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: globalThis.Array<any>}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createDateFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); binding?: (string | ((item: any) => PackageCore.Date)); filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: PackageCore.Date}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createDateRangeFilter(options: {automationId?: string; id: string; label: (string | PackageCore.Translation); binding?: (string | ((item: any) => PackageCore.Date)); filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: Self.DateRange.Range}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createTimeFilter(options: {id: string; label: (string | PackageCore.Translation); binding?: (string | ((item: any) => PackageCore.Time)); format?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: PackageCore.Time}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function createTimeRangeFilter(options: {id: string; label: (string | PackageCore.Translation); binding?: (string | ((item: any) => PackageCore.Time)); format?: string; filterPredicate?: Self.FilterFactory.FilterPredicateCallback; value?: {start: PackageCore.Time; end: PackageCore.Time}}): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		function create(type: Self.FilterFactory.Type, options: object): Self.FilterFactory.Filter;

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		enum Type {
			TEXT_BOX,
			DROPDOWN,
			MULTISELECT_DROPDOWN,
			CHECK_BOX,
			DATE,
			TIME,
			DATE_RANGE,
			TIME_RANGE,
		}

		/**
		 * @deprecated Replaced by ListView.Filter JSX
		 */
		export import TextBoxMatchingOperator = Self.ListViewConstant.TextBoxFilterMatchingOperator;

	}

	export class FilterPanel extends PackageCore.Component {
		constructor(options: Self.FilterPanel.Options);

		state: globalThis.Array<Self.FilterPanel.FilterState>;

		/**
		 * @deprecated
		 */
		filters: globalThis.Array<Self.FilterPanel.FilterDefinition>;

		activeFilters: globalThis.Array<Self.FilterPanel.FilterState>;

		activeFiltersCount: number;

		hasActiveFilters: boolean;

		children: PackageCore.VDom.Children;

		values: (Self.FilterPanel.FilterValueMap | null);

		showClearAll: boolean;

		orientation: Self.FilterPanel.Orientation;

		filtersExpanded: boolean;

		onFiltersChanged: (Self.FilterPanel.FiltersChangedCallback | null);

		onFiltersExpanded: (Self.FilterPanel.FiltersExpandedCallback | null);

		/**
		 * @deprecated
		 */
		filtersVisibilityToggle: Self.FilterPanelToggle;

		getState(): globalThis.Array<Self.FilterPanel.FilterState>;

		getActiveFiltersCount(): number;

		isAnyFilterActive(): boolean;

		clearAllFilters(): void;

		static Horizontal(props?: Self.FilterPanel.Options): PackageCore.JSX.Element;

		static Vertical(props?: Self.FilterPanel.Options): PackageCore.JSX.Element;

		static Item(props: Self.FilterPanel.ItemOptions): PackageCore.JSX.Element;

		static Event: Self.FilterPanel.EventTypes;

	}

	export namespace FilterPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			filters?: globalThis.Array<Self.FilterPanel.FilterDefinition>;

			values?: Self.FilterPanel.FilterValueMap;

			orientation?: Self.FilterPanel.Orientation;

			showClearAll?: boolean;

			horizontalExpansionEnabled?: boolean;

			filtersExpanded?: boolean;

			onFiltersChanged?: Self.FilterPanel.FiltersChangedCallback;

			onFiltersExpanded?: Self.FilterPanel.FiltersExpandedCallback;

		}

		type FilterId = (string | number);

		type FilterValueMap = Record<Self.FilterPanel.FilterId, any>;

		interface FilterDefinition {
			id: Self.FilterPanel.FilterId;

			filterChip: Self.FilterChip;

		}

		interface FilterState {
			id: Self.FilterPanel.FilterId;

			activated: boolean;

			value: any;

		}

		type FiltersChangedCallback = (args: Self.FilterPanel.FiltersChangedCallbackArgs) => void;

		interface FiltersChangedCallbackArgs {
			values: Self.FilterPanel.FilterValueMap;

			previousValues: Self.FilterPanel.FilterValueMap;

			changedFilters: Self.FilterPanel.FilterValueMap;

		}

		type FiltersExpandedCallback = (args: Self.FilterPanel.FiltersExpandedCallbackArgs) => void;

		interface FiltersExpandedCallbackArgs {
			expanded: boolean;

		}

		interface ItemOptions {
			children?: PackageCore.VDom.Children;

			id: Self.FilterPanel.FilterId;

			key?: any;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			STATE_UPDATED: string;

		}

		export import Toggle = Self.FilterPanelToggle;

		enum Reason {
			FILTER_VALUE_CHANGED,
			CLEAR_ALL,
			FILTERS_SETTER,
			VISIBILITY_CHANGED,
		}

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

	}

	class FilterPanelToggle extends PackageCore.Component {
		constructor(options?: Self.FilterPanelToggle.Options);

		toggled: boolean;

		activeFiltersCount: number;

		behavior: Self.Button.Behavior;

		action: Self.Button.ActionCallback;

		onToggled: (Self.FilterPanelToggle.ToggledCallback | null);

	}

	namespace FilterPanelToggle {
		interface Options {
			toggled?: boolean;

			activeFiltersCount?: number;

			FilterPanelToggle?: Self.Button.Behavior;

			action?: Self.Button.ActionCallback;

			onToggled?: Self.FilterPanelToggle.ToggledCallback;

		}

		type ToggledCallback = (args: Self.FilterPanelToggle.ToggledCallbackArgs, sender: Self.FilterPanelToggle) => void;

		interface ToggledCallbackArgs {
			toggled: boolean;

		}

		export import Behavior = Self.Button.Behavior;

	}

	class FilterPositionToggleGroup extends PackageCore.Component {
		constructor(options?: Self.FilterPositionToggleGroup.Options);

		filtersPosition: Self.FilterPositionToggleGroup.FiltersPosition;

		activeFiltersCount: number;

		onFiltersPositionChanged: Self.FilterPositionToggleGroup.FiltersPositionChangedCallback;

	}

	namespace FilterPositionToggleGroup {
		interface Options {
			filtersPosition?: Self.FilterPositionToggleGroup.FiltersPosition;

			activeFiltersCount?: number;

			onFiltersPositionChanged?: Self.FilterPositionToggleGroup.FiltersPositionChangedCallback;

		}

		type FiltersPositionChangedCallback = (args: Self.FilterPositionToggleGroup.FiltersPositionChangedCallbackArgs, sender: Self.FilterPositionToggleGroup) => void;

		interface FiltersPositionChangedCallbackArgs {
			position: Self.FilterPositionToggleGroup.FiltersPosition;

			previousPosition: Self.FilterPositionToggleGroup.FiltersPosition;

		}

		export import FiltersPosition = Self.ListViewConstant.FiltersPosition;

	}

	export function FixedLayout(props?: {topContent?: (PackageCore.Component | PackageCore.JSX.Element | null); children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	export class FormContext {
	}

	export namespace FormContext {
	}

	export class FormattedText extends PackageCore.Component {
		constructor(options?: (Self.FormattedText.Options | string | number | PackageCore.Translation));

		text: (string | number | PackageCore.Translation);

		children: PackageCore.VDom.Children;

		formatter: Self.FormattedText.Formatter;

		options: Self.FormattedText.FormatterOptions;

		decorator: (PackageCore.Decorator | null);

		wrap: (boolean | number);

		whitespace: boolean;

		setText(text: (string | number | PackageCore.Translation)): void;

		setFormatter(formatter: Self.FormattedText.Formatter): void;

		setOptions(options: Self.FormattedText.FormatterOptions): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		setWrap(value: (boolean | number)): void;

		setWhitespace(value: boolean): void;

		setFormatterAndOptions(formatter: Self.FormattedText.Formatter, options: Self.FormattedText.FormatterOptions): void;

		private _attachEllipsisHelper(i18n: PackageCore.I18n): void;

		private _getFormattedItems(i18n: PackageCore.I18n): any;

		static markdown(text?: (string | number | PackageCore.Translation), options?: Self.FormattedText.Options): Self.FormattedText;

		static Markdown(): PackageCore.JSX.Element;

		static bold(text?: (string | number | PackageCore.Translation), formatterOptions?: Self.FormattedText.FormatterOptions, options?: Self.FormattedText.Options): Self.FormattedText;

		static Bold(): PackageCore.JSX.Element;

		static italic(text?: (string | number | PackageCore.Translation), formatterOptions?: Self.FormattedText.FormatterOptions, options?: Self.FormattedText.Options): Self.FormattedText;

		static Italic(): PackageCore.JSX.Element;

		static link(text?: (string | number | PackageCore.Translation), formatterOptions?: Self.FormattedText.FormatterOptions, options?: Self.FormattedText.Options): Self.FormattedText;

		static Link(): PackageCore.JSX.Element;

		static getStyles(): void;

	}

	export namespace FormattedText {
		interface FormatterOptions {
			highlights?: (globalThis.Array<string> | globalThis.Array<number> | globalThis.Array<PackageCore.Translation> | globalThis.Array<Self.FormattedText.LinkHighlight>);

			ignoreCase?: boolean;

			multiMatch?: boolean;

			linkOptions?: Self.Link.Options;

			textOptions?: Self.Text.Options;

		}

		interface LinkHighlight {
			content?: (string | number | PackageCore.Translation);

			url?: string;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			decorator?: PackageCore.Decorator;

			formatter?: Self.FormattedText.Formatter;

			options?: Self.FormattedText.FormatterOptions;

			text?: (string | number | PackageCore.Translation);

			whitespace?: boolean;

			wrap?: (boolean | number);

		}

		enum Formatter {
			NONE,
			BOLD,
			ITALIC,
			LINK,
			MARKDOWN,
			ACCESS_KEY,
		}

	}

	export class GanttChart extends PackageCore.Component {
		constructor(options: Self.GanttChart.Options);

		columns: globalThis.Array<Self.GanttChart.ColumnDefinition>;

		resources: globalThis.Array<Self.GanttChart.ResourceDefinition>;

		tasks: globalThis.Array<Self.GanttChart.TaskDefinition>;

		assignments: globalThis.Array<Self.GanttChart.AssignmentDefinition>;

		dependencies: globalThis.Array<Self.GanttChart.DependencyDefinition>;

		calendars: (globalThis.Array<Self.GanttChart.CalendarDefinition> | null);

		startDate: PackageCore.Date;

		endDate: PackageCore.Date;

		projectCalendar: Self.GanttChart.Id;

		resourceStyle: (string | PackageCore.Style | object | Self.GanttChart.ResourceStyleCallback | null);

		timeRanges: (globalThis.Array<Self.GanttChart.TimeRange> | null);

		resourceTimeRanges: (globalThis.Array<Self.GanttChart.ResourceTimeRange> | null);

		resourceTimeRangeContent: (Self.GanttChart.ResourceTimeRangeContentCallback | null);

		taskResize: boolean;

		taskDrag: boolean;

		rowHeight: (number | null);

		resizableStartColumnRegion: boolean;

		resizableEndColumnRegion: boolean;

		startColumnRegionMaxWidth: (number | null);

		endColumnRegionMaxWidth: (number | null);

		expanded: boolean;

		firstDayOfWeek: (number | null);

		showCriticalPath: boolean;

		showBaselines: boolean;

		viewPreset: (Self.GanttChart.ViewPreset | Self.GanttChart.ViewPresetConfig);

		taskColor: (Self.GanttChart.TaskColor | Self.GanttChart.TaskCustomColor | PackageCore.Color | Self.GanttChart.TaskColorCallback);

		taskHorizontalMargin: number;

		taskVerticalMargin: number;

		taskMinimumWidth: number;

		gridLines: Self.GanttChart.GridLines;

		resourceGridLines: boolean;

		gridColumnContent: (Self.GanttChart.GridColumnContentCallback | null);

		gridRowContent: (Self.GanttChart.GridRowContentCallback | null);

		taskTooltip: (Self.GanttChart.TaskTooltipCallback | null);

		taskLabel: (Self.GanttChart.TaskLabelCallback | null);

		taskStyle: (string | PackageCore.Style | object | Self.GanttChart.TaskStyleCallback | null);

		taskPosition: (Self.GanttChart.TaskPositionCallback | null);

		taskOuterLabel: (Self.GanttChart.TaskOuterLabelCallback | null);

		dragTaskPosition: (Self.GanttChart.DragTaskPositionCallback | null);

		baselineHeight: number;

		baselineColor: (PackageCore.Color | Self.GanttChart.BaselineColorCallback | null);

		baselineStyle: (string | PackageCore.Style | object | Self.GanttChart.BaselineStyleCallback | null);

		baselineTooltip: (Self.GanttChart.BaselineTooltipCallback | null);

		expandedResources: (globalThis.Array<Self.GanttChart.Id> | globalThis.Set<Self.GanttChart.Id> | null);

		timelineTooltip: (Self.GanttChart.TimelineTooltipCallback | null);

		taskResizeTooltip: (Self.GanttChart.TaskResizeTooltipCallback | null);

		taskResizeValidator: (Self.GanttChart.TaskResizeValidatorCallback | null);

		taskDragTooltip: (Self.GanttChart.TaskDragTooltipCallback | null);

		dropValidator: Self.GanttChart.DropValidatorCallback;

		dropPlaceholder: (Self.GanttChart.DropPlaceholder | null);

		onResourceClick: (Self.GanttChart.ResourceClickCallback | null);

		onResourceDoubleClick: (Self.GanttChart.ResourceClickCallback | null);

		onTaskClick: (Self.GanttChart.TaskClickCallback | null);

		onTaskDoubleClick: (Self.GanttChart.TaskClickCallback | null);

		onTaskContextMenu: (Self.GanttChart.TaskContextMenuCallback | null);

		onTaskResized: (Self.GanttChart.TaskResizedCallback | null);

		onTaskMoved: (Self.GanttChart.TaskMovedCallback | null);

		onTaskDropPlaceholderUpdate: (Self.GanttChart.TaskDropPlaceholderUpdateCallback | null);

		onResourceExpanded: (Self.GanttChart.ResourceExpandedCallback | null);

		scrollTo(args: {resourceId?: Self.GanttChart.Id; date?: PackageCore.Date; mode?: Self.GanttChart.ScrollToMode}): void;

		static weekendIntervals(startDate: PackageCore.Date, endDate: PackageCore.Date, options: Partial<Self.GanttChart.CalendarIntervalDefinition>): globalThis.Array<Self.GanttChart.CalendarIntervalDefinition>;

		static extendViewPreset(base: Self.GanttChart.ViewPreset, options: Partial<Self.GanttChart.ViewPresetConfig>): void;

	}

	export namespace GanttChart {
		interface Options extends PackageCore.Component.Options {
			columns: globalThis.Array<Self.GanttChart.ColumnDefinition>;

			resources: globalThis.Array<Self.GanttChart.ResourceDefinition>;

			tasks: globalThis.Array<Self.GanttChart.TaskDefinition>;

			assignments: globalThis.Array<Self.GanttChart.AssignmentDefinition>;

			dependencies?: globalThis.Array<Self.GanttChart.DependencyDefinition>;

			calendars?: globalThis.Array<Self.GanttChart.CalendarDefinition>;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

			projectCalendar?: Self.GanttChart.Id;

			timeRanges?: globalThis.Array<Self.GanttChart.TimeRange>;

			resourceTimeRanges?: globalThis.Array<Self.GanttChart.ResourceTimeRange>;

			resourceTimeRangeContent?: Self.GanttChart.ResourceTimeRangeContentCallback;

			resourceStyle?: (string | PackageCore.Style | object | Self.GanttChart.ResourceStyleCallback);

			taskResize?: boolean;

			taskDrag?: boolean;

			taskHorizontalMargin?: number;

			taskVerticalMargin?: number;

			taskMinimumWidth?: number;

			rowHeight?: number;

			resizableStartColumnRegion?: boolean;

			resizableEndColumnRegion?: boolean;

			startColumnRegionMaxWidth?: (number | null);

			endColumnRegionMaxWidth?: (number | null);

			firstDayOfWeek?: number;

			showCriticalPath?: boolean;

			showBaselines?: boolean;

			baselineHeight?: number;

			baselineColor?: (PackageCore.Color | Self.GanttChart.BaselineColorCallback);

			baselineStyle?: (string | PackageCore.Style | object | Self.GanttChart.BaselineStyleCallback);

			baselineTooltip?: Self.GanttChart.BaselineTooltipCallback;

			viewPreset?: (Self.GanttChart.ViewPreset | Self.GanttChart.ViewPresetConfig);

			taskColor?: (Self.GanttChart.TaskColor | Self.GanttChart.TaskCustomColor | PackageCore.Color | Self.GanttChart.TaskColorCallback);

			gridLines?: Self.GanttChart.GridLines;

			resourceGridLines?: boolean;

			gridColumnContent?: Self.GanttChart.GridColumnContentCallback;

			gridRowContent?: Self.GanttChart.GridRowContentCallback;

			expandedResources?: (globalThis.Array<Self.GanttChart.Id> | globalThis.Set<Self.GanttChart.Id>);

			expanded?: boolean;

			dropValidator?: Self.GanttChart.DropValidatorCallback;

			taskTooltip?: Self.GanttChart.TaskTooltipCallback;

			taskResizeTooltip?: Self.GanttChart.TaskResizeTooltipCallback;

			taskDragTooltip?: Self.GanttChart.TaskDragTooltipCallback;

			taskResizeValidator?: Self.GanttChart.TaskResizeValidatorCallback;

			taskLabel?: Self.GanttChart.TaskLabelCallback;

			taskStyle?: (string | PackageCore.Style | object | Self.GanttChart.TaskStyleCallback);

			taskPosition?: Self.GanttChart.TaskPositionCallback;

			taskOuterLabel?: Self.GanttChart.TaskOuterLabelCallback;

			dragTaskPosition?: Self.GanttChart.DragTaskPositionCallback;

			onResourceClick?: Self.GanttChart.ResourceClickCallback;

			onResourceDoubleClick?: Self.GanttChart.ResourceClickCallback;

			onTaskClick?: Self.GanttChart.TaskClickCallback;

			onTaskDoubleClick?: Self.GanttChart.TaskClickCallback;

			onTaskContextMenu?: Self.GanttChart.TaskContextMenuCallback;

			onResourceExpanded?: Self.GanttChart.ResourceExpandedCallback;

			onTaskResized?: Self.GanttChart.TaskResizedCallback;

			onTaskMoved?: Self.GanttChart.TaskMovedCallback;

			onTaskDropPlaceholderUpdate?: Self.GanttChart.TaskDropPlaceholderUpdateCallback;

			timelineTooltip?: Self.GanttChart.TimelineTooltipCallback;

		}

		type Id = (string | number);

		interface ColumnDefinition {
			id: Self.GanttChart.Id;

			type?: Self.GanttChart.ColumnType;

			label: (string | Self.GanttChart.ColumnLabelCallback);

			labelAlignment?: Self.GanttChart.LabelAlignment;

			resourceLabel?: Self.GanttChart.ResourceLabelCallback;

			field?: string;

			controls?: globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>;

			region?: Self.GanttChart.ColumnRegion;

			resourceTooltip?: Self.GanttChart.ResourceTooltipCallback;

			width?: number;

		}

		interface ResourceDefinition {
			id: Self.GanttChart.Id;

			height?: number;

			taskColor?: (Self.GanttChart.TaskColor | Self.GanttChart.TaskCustomColor | PackageCore.Color);

			style?: (string | PackageCore.Style | object);

			calendar?: Self.GanttChart.Id;

			children?: globalThis.Array<Self.GanttChart.ResourceDefinition>;

		}

		interface TaskDefinition {
			id: Self.GanttChart.Id;

			parentId?: Self.GanttChart.Id;

			startDate: PackageCore.Date;

			endDate?: PackageCore.Date;

			type?: Self.GanttChart.TaskType;

			color?: (Self.GanttChart.TaskColor | Self.GanttChart.TaskCustomColor | PackageCore.Color);

			percentDone?: number;

			resizable?: boolean;

			draggable?: boolean;

			baselines?: globalThis.Array<Self.GanttChart.BaselineDefinition>;

			label?: (string | Self.GanttChart.TaskLabelCallback);

			style?: (string | PackageCore.Style | object);

		}

		interface BaselineDefinition {
			id: Self.GanttChart.Id;

			startDate: PackageCore.Date;

			endDate?: PackageCore.Date;

			color?: PackageCore.Color;

			style?: (string | PackageCore.Style | object);

		}

		interface AssignmentDefinition {
			id: Self.GanttChart.Id;

			resourceId: Self.GanttChart.Id;

			taskId: Self.GanttChart.Id;

		}

		interface DependencyDefinition {
			id: Self.GanttChart.Id;

			fromTask: Self.GanttChart.Id;

			toTask: Self.GanttChart.Id;

			fromSide?: Self.GanttChart.TaskSide;

			toSide?: Self.GanttChart.TaskSide;

			bidirectional?: boolean;

		}

		interface CalendarDefinition {
			id: Self.GanttChart.Id;

			intervals: globalThis.Array<Self.GanttChart.CalendarIntervalDefinition>;

		}

		interface CalendarIntervalDefinition {
			id: Self.GanttChart.Id;

			startDate?: PackageCore.Date;

			endDate?: PackageCore.Date;

			style?: (string | PackageCore.Style);

			tooltip?: (string | PackageCore.JSX.Element);

			content?: (string | Self.GanttChart.CalendarIntervalContentCallback);

		}

		type ColumnLabelCallback = (args: Self.GanttChart.ColumnLabelCallbackArgs) => (string | PackageCore.JSX.Element);

		interface ColumnLabelCallbackArgs {
			column: Self.GanttChart.ColumnDefinition;

		}

		type ResourceLabelCallback = (args: Self.GanttChart.ResourceLabelCallbackArgs) => (string | PackageCore.JSX.Element);

		interface ResourceLabelCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			column: Self.GanttChart.ColumnDefinition;

		}

		type ResourceTooltipCallback = (args: Self.GanttChart.ResourceTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface ResourceTooltipCallbackArgs {
			column: Self.GanttChart.ColumnDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		interface TaskCustomColor {
			color: PackageCore.Color;

			done?: PackageCore.Color;

		}

		type TaskColorCallback = (args: Self.GanttChart.TaskColorCallbackArgs) => (Self.GanttChart.TaskColor | Self.GanttChart.TaskCustomColor | PackageCore.Color | null);

		interface TaskColorCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type TaskLabelCallback = (args: Self.GanttChart.TaskLabelCallbackArgs) => (string | number | PackageCore.JSX.Element);

		interface TaskLabelCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			task: Self.GanttChart.TaskDefinition;

		}

		type TaskOuterLabelCallback = (args: Self.GanttChart.TaskOuterLabelCallbackArgs) => Self.GanttChart.TaskOuterLabelConfig;

		interface TaskOuterLabelCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			task: Self.GanttChart.TaskDefinition;

		}

		interface TaskOuterLabelConfig {
			before?: (string | number | PackageCore.JSX.Element);

			after?: (string | number | PackageCore.JSX.Element);

			above?: (string | number | PackageCore.JSX.Element);

			below?: (string | number | PackageCore.JSX.Element);

		}

		type ResourceClickCallback = (args: Self.GanttChart.ResourceClickCallbackArgs) => (boolean | void);

		interface ResourceClickCallbackArgs {
			column: Self.GanttChart.ColumnDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type TaskClickCallback = (args: Self.GanttChart.TaskClickCallbackArgs) => (boolean | void);

		interface TaskClickCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			task: Self.GanttChart.TaskDefinition;

		}

		type TaskContextMenuCallback = (args: Self.GanttChart.TaskContextMenuArgs) => (Self.GanttChart.TaskContextMenuDefinition | null);

		interface TaskContextMenuArgs {
			resource: Self.GanttChart.ResourceDefinition;

			task: Self.GanttChart.TaskDefinition;

		}

		interface TaskContextMenuDefinition {
			items: (globalThis.Array<Self.MenuItem.ItemDefinition> | null);

		}

		type TaskTooltipCallback = (args: Self.GanttChart.TaskTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface TaskTooltipCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			task: Self.GanttChart.TaskDefinition;

		}

		type TaskStyleCallback = (args: Self.GanttChart.TaskStyleCallbackArgs) => (string | PackageCore.Style | object | null);

		interface TaskStyleCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type ResourceStyleCallback = (args: Self.GanttChart.ResourceStyleCallbackArgs) => (string | PackageCore.Style | object | null);

		interface ResourceStyleCallbackArgs {
			column: Self.GanttChart.ColumnDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type TaskPositionCallback = (args: Self.GanttChart.TaskPositionCallbackArgs) => Self.GanttChart.TaskPositionCallbackResult;

		interface TaskPositionCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		interface TaskPositionCallbackResult {
			top: number;

			height: number;

		}

		type DragTaskPositionCallback = (args: Self.GanttChart.DragTaskPositionCallbackArgs) => Self.GanttChart.DragTaskPositionCallbackResult;

		interface DragTaskPositionCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

		}

		interface DragTaskPositionCallbackResult {
			top: number;

			height: number;

		}

		type ResourceExpandedCallback = (args: Self.GanttChart.ResourceExpandedCallbackArgs) => void;

		interface ResourceExpandedCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

			expanded: boolean;

		}

		type TaskResizedCallback = (args: Self.GanttChart.TaskResizedCallbackArgs) => void;

		interface TaskResizedCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			previousTask: Self.GanttChart.TaskDefinition;

			startDate: PackageCore.Date;

			previousStartDate: PackageCore.Date;

			endDate: PackageCore.Date;

			previousEndDate: PackageCore.Date;

		}

		type TaskMovedCallback = (args: Self.GanttChart.TaskMovedCallbackArgs) => void;

		interface TaskMovedCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			previousTask: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			previousResource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			previousStartDate: PackageCore.Date;

			endDate: PackageCore.Date;

			previousEndDate: PackageCore.Date;

		}

		type BaselineColorCallback = (args: Self.GanttChart.BaselineColorCallbackArgs) => (PackageCore.Color | null);

		interface BaselineColorCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			baseline: Self.GanttChart.BaselineDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type BaselineStyleCallback = (args: Self.GanttChart.BaselineStyleCallbackArgs) => (string | PackageCore.Style | object | null);

		interface BaselineStyleCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			baseline: Self.GanttChart.BaselineDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type BaselineTooltipCallback = (args: Self.GanttChart.BaselineTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface BaselineTooltipCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			baseline: Self.GanttChart.BaselineDefinition;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type TaskDropPlaceholderUpdateCallback = (args: Self.GanttChart.TaskDropPlaceholderUpdateCallbackArgs) => void;

		interface TaskDropPlaceholderUpdateCallbackArgs {
			placeholder: (Self.GanttChart.DropPlaceholder | null);

		}

		interface DropPlaceholder {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

		}

		interface ViewPresetConfig {
			tickWidth: number;

			rowHeight?: number;

			timelines: globalThis.Array<Self.GanttChart.TimelineConfig>;

			timeResolution?: Self.GanttChart.TimeResolutionConfig;

		}

		interface TimelineConfig {
			unit: Self.GanttChart.TimelineUnit;

			alignment?: Self.GanttChart.LabelAlignment;

			height?: number;

			label: (string | Self.GanttChart.TimelineLabelCallback);

		}

		type TimelineLabelCallback = (args: Self.GanttChart.TimelineLabelCallbackArgs) => (string | PackageCore.JSX.Element);

		interface TimelineLabelCallbackArgs {
			unit: Self.GanttChart.TimelineUnit;

			startDate: PackageCore.Date;

			i18n: PackageCore.I18n;

			formatService: PackageCore.FormatService;

			firstDayOfWeek: number;

		}

		type TimelineTooltipCallback = (args: Self.GanttChart.TimelineTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface TimelineTooltipCallbackArgs {
			unit: Self.GanttChart.TimelineUnit;

			startDate: PackageCore.Date;

			i18n: PackageCore.I18n;

			formatService: PackageCore.FormatService;

			firstDayOfWeek: number;

		}

		type TaskResizeTooltipCallback = (args: Self.GanttChart.TaskResizeTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface TaskResizeTooltipCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

		}

		type TaskResizeValidatorCallback = (args: Self.GanttChart.TaskResizeTooltipCallbackArgs) => boolean;

		interface TaskResizeValidatorCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

		}

		type TaskDragTooltipCallback = (args: Self.GanttChart.TaskDragTooltipCallbackArgs) => (string | PackageCore.JSX.Element | null);

		interface TaskDragTooltipCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			resource: Self.GanttChart.ResourceDefinition;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

		}

		interface TimeResolutionConfig {
			unit: Self.GanttChart.TimelineUnit;

			increment: number;

		}

		type GridColumnContentCallback = (args: Self.GanttChart.GridColumnContentCallbackArgs) => (string | PackageCore.Style | PackageCore.JSX.Element | null);

		interface GridColumnContentCallbackArgs {
			startDate: PackageCore.Date;

		}

		type GridRowContentCallback = (args: Self.GanttChart.GridRowContentCallbackArgs) => (string | PackageCore.Style | PackageCore.JSX.Element | null);

		interface GridRowContentCallbackArgs {
			resource: Self.GanttChart.ResourceDefinition;

		}

		interface TimeRange {
			id: Self.GanttChart.Id;

			startDate: PackageCore.Date;

			endDate?: PackageCore.Date;

			headerStyle?: (string | PackageCore.Style);

			headerTooltip?: (string | PackageCore.JSX.Element);

			headerContent?: (string | PackageCore.JSX.Element | Self.GanttChart.TimeRangeContentCallback);

			bodyStyle?: (string | PackageCore.Style);

			bodyTooltip?: (string | PackageCore.JSX.Element);

			bodyContent?: (string | PackageCore.JSX.Element | Self.GanttChart.TimeRangeContentCallback);

		}

		type TimeRangeContentCallback = (args: Self.GanttChart.TimeRangeContentCallbackArgs) => PackageCore.JSX.Element;

		interface TimeRangeContentCallbackArgs {
			range: Self.GanttChart.TimeRange;

		}

		interface ResourceTimeRange {
			id: Self.GanttChart.Id;

			resourceId: Self.GanttChart.Id;

			startDate: PackageCore.Date;

			endDate: PackageCore.Date;

			style?: (string | PackageCore.Style);

			tooltip?: (string | PackageCore.JSX.Element);

			content?: (string | PackageCore.JSX.Element | Self.GanttChart.ResourceTimeRangeContentCallback);

		}

		type ResourceTimeRangeContentCallback = (args: Self.GanttChart.ResourceTimeRangeContentCallbackArgs) => PackageCore.JSX.Element;

		interface ResourceTimeRangeContentCallbackArgs {
			range: Self.GanttChart.ResourceTimeRange;

			resource: Self.GanttChart.ResourceDefinition;

		}

		type CalendarIntervalContentCallback = (args: Self.GanttChart.CalendarIntervalContentCallbackArgs) => PackageCore.JSX.Element;

		interface CalendarIntervalContentCallbackArgs {
			interval: Self.GanttChart.CalendarIntervalDefinition;

			resource?: Self.GanttChart.ResourceDefinition;

		}

		type DropValidatorCallback = (args: Self.GanttChart.DropValidatorCallbackArgs) => (boolean | Self.GanttChart.DropValidatorCallbackResult);

		interface DropValidatorCallbackArgs {
			task: Self.GanttChart.TaskDefinition;

			sourceResource: Self.GanttChart.ResourceDefinition;

			targetResource: Self.GanttChart.ResourceDefinition;

			sourceStartDate: PackageCore.Date;

			targetStartDate: PackageCore.Date;

			sourceEndDate: PackageCore.Date;

			targetEndDate: PackageCore.Date;

		}

		interface DropValidatorCallbackResult {
			resourceId?: Self.GanttChart.Id;

			startDate?: PackageCore.Date;

			endDate?: PackageCore.Date;

		}

		enum ColumnRegion {
			START,
			END,
		}

		export import ColumnType = Self.GanttConstant.ColumnType;

		export import LabelAlignment = Self.GanttConstant.LabelAlignment;

		export import ViewPreset = Self.GanttConstant.ViewPreset;

		export import TimelineLabel = Self.GanttTimelineLabel;

		enum GridLines {
			NONE,
			HORIZONTAL,
			VERTICAL,
			BOTH,
		}

		export import TaskColor = Self.GanttConstant.TaskColor;

		export import TimelineUnit = Self.GanttConstant.TimelineUnit;

		export import TaskType = Self.GanttConstant.TaskType;

		export import TaskSide = Self.GanttConstant.TaskSide;

		export import TaskLabelLocation = Self.GanttConstant.TaskLabelLocation;

		export import ScrollToMode = PackageCore.ScrollController.ScrollToMode;

	}

	namespace GanttConstant {
		enum ColumnType {
			DEFAULT,
			ROW_NUMBER,
			TREE,
		}

		enum LabelAlignment {
			START,
			CENTER,
			END,
		}

		enum ViewPreset {
			DAY_HOUR,
			WEEK_DAY,
			WEEK_DAY_HOUR,
			MONTH_DAY,
			MONTH_DAY_HOUR,
			MONTH_WEEK,
			MONTH_WEEK_DAY,
			YEAR_MONTH,
			YEAR_MONTH_WEEK,
		}

		enum TimelineUnit {
			YEAR,
			MONTH,
			WEEK,
			DAY,
			HOUR,
			MINUTE,
			SECOND,
			MILLISECOND,
		}

		enum TaskColor {
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			THEMED,
			RED,
		}

		enum TaskType {
			LEAF,
			PARENT,
			MILESTONE,
		}

		enum TaskSide {
			TOP,
			BOTTOM,
			START,
			END,
		}

		enum TaskLabelLocation {
			ABOVE,
			BELOW,
			BEFORE,
			AFTER,
		}

	}

	export namespace GanttTimelineLabel {
		function dateFormat(args: {format: string}): Self.GanttChart.TimelineLabelCallback;

		function hour(args?: object): Self.GanttChart.TimelineLabelCallback;

		function dayName(args?: {short?: boolean}): Self.GanttChart.TimelineLabelCallback;

		function dayLetter(args?: object): Self.GanttChart.TimelineLabelCallback;

		function dayNameWithDate(args?: {short?: boolean; dateFormat?: string}): Self.GanttChart.TimelineLabelCallback;

		function dayNumber(args?: object): Self.GanttChart.TimelineLabelCallback;

		function weekDateRange(args?: object): Self.GanttChart.TimelineLabelCallback;

		function weekNumber(args?: object): Self.GanttChart.TimelineLabelCallback;

	}

	export enum GapSize {
		NONE,
		XXXXS,
		XXXS,
		XXS,
		XS,
		S,
		M,
		L,
		XL,
		XXL,
		XXXL,
		XXXXL,
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
		SMALL,
		MEDIUM,
		LARGE,
	}

	namespace GapSizeHelper {
		interface SizeObject {
			top: (Self.GapSize | null);

			bottom: (Self.GapSize | null);

			start: (Self.GapSize | null);

			end: (Self.GapSize | null);

			horizontal: (Self.GapSize | null);

			vertical: (Self.GapSize | null);

		}

		interface SizeDefinition {
			top: Self.GapSize;

			bottom: Self.GapSize;

			start: Self.GapSize;

			end: Self.GapSize;

		}

		interface SizeClassObject {
			top: Self.GapSizeHelper.SideClassObject;

			bottom: Self.GapSizeHelper.SideClassObject;

			start: Self.GapSizeHelper.SideClassObject;

			end: Self.GapSizeHelper.SideClassObject;

		}

		interface SideClassObject {
			xxxxs: PackageCore.Style;

			xxxs: PackageCore.Style;

			xxs: PackageCore.Style;

			xs: PackageCore.Style;

			s: PackageCore.Style;

			m: PackageCore.Style;

			l: PackageCore.Style;

			xl: PackageCore.Style;

			xxl: PackageCore.Style;

			xxxl: PackageCore.Style;

			xxxxl: PackageCore.Style;

			small: PackageCore.Style;

			medium: PackageCore.Style;

			large: PackageCore.Style;

		}

		enum CssProperty {
			PADDING,
			MARGIN,
		}

		enum Side {
			TOP,
			BOTTOM,
			START,
			END,
		}

		function parseGapSize(gapSize?: (Self.GapSizeHelper.SizeObject | Self.GapSize)): Self.GapSizeHelper.SizeDefinition;

		function getGapClasses(property: Self.GapSizeHelper.SizeClassObject, value: (Self.GapSizeHelper.SizeObject | Self.GapSize)): globalThis.Array<PackageCore.Style>;

		function generateGapClasses(cssProperty: Self.GapSizeHelper.CssProperty, tokens: object): Self.GapSizeHelper.SizeClassObject;

		function generateGapSideClass(cssProperty: Self.GapSizeHelper.CssProperty, side: Self.GapSizeHelper.Side, tokens: object): Self.GapSizeHelper.SideClassObject;

		function getGapDataAttributes(value: Self.GapSizeHelper.SizeObject): string;

		function GapSizeType(gapEnum: object, gapEnumName?: string): PackageCore.Type.Matcher;

	}

	export class GrabCell extends Self.GridCell {
		constructor();

		showDirtyFlag: boolean;

		showLineNumber: boolean;

		resizable: boolean;

		effectiveResizable: boolean;

		updateLineNumber(): void;

		updateDirtyFlag(): void;

		setResizable(value: boolean): void;

	}

	export namespace GrabCell {
	}

	export class GrabColumn extends Self.GridColumn {
		constructor(options: Self.GrabColumn.Options);

		showDirtyFlag: boolean;

		showLineNumber: boolean;

	}

	export namespace GrabColumn {
		interface Options extends Self.GridColumn.Options {
			showDirtyFlag?: boolean;

			showLineNumber?: boolean;

		}

		export import Cell = Self.GrabCell;

	}

	export interface GridBindingController {
		bindRow(row: Self.GridDataRow, options: object): void;

		unbindRow(row: Self.GridDataRow, options: object): void;

		commitRow(row: Self.GridDataRow, options: object): void;

		rollbackRow(row: Self.GridDataRow, options: object): void;

		reloadRow(row: Self.GridDataRow, options: object): void;

		reloadCell(row: Self.GridDataRow, options: object): void;

		getCellParameters(row: Self.GridDataRow, column: Self.GridColumn): void;

		handleCellUpdate(update: object): void;

		updateBindings(rootColumn: Self.GridColumn): void;

	}

	export namespace GridBindingController {
	}

	class GridBindingControllerWithCache extends Self.GridObservingBindingController {
	}

	namespace GridBindingControllerWithCache {
	}

	export class GridCell extends PackageCore.Component {
		constructor(options: Self.GridCell.Options);

		value: any;

		row: Self.GridRow;

		column: Self.GridColumn;

		dataGrid: Self.DataGrid;

		userData: object;

		rowOverlap: number;

		columnOverlap: number;

		inputMode: Self.GridCell.InputMode;

		editMode: boolean;

		editOnly: boolean;

		editable: boolean;

		effectiveEditable: boolean;

		immediateUpdate: boolean;

		effectiveImmediateUpdate: boolean;

		dirty: boolean;

		renderData: (object | null);

		draggable: boolean;

		effectiveDraggable: boolean;

		cursor: boolean;

		horizontalAlignment: Self.GridColumn.HorizontalAlignment;

		verticalAlignment: Self.GridColumn.VerticalAlignment;

		comparator: (((left: any, right: any) => boolean) | null);

		validator: (Self.GridCell.ValidatorCallback | null);

		content: (PackageCore.Component | null);

		viewContent: (PackageCore.Component | null);

		editContent: (PackageCore.Component | null);

		physicalIndex: (number | null);

		informativeIcon: (Self.Image | null);

		showStatusIcon: boolean;

		effectiveShowStatusIcon: boolean;

		helperButtons: globalThis.Array<Self.Button>;

		showRangeResizer: boolean;

		activate(scrollIntoView: boolean): void;

		acceptChanges(): void;

		discardChanges(): void;

		refresh(): void;

		reload(): void;

		setValue(value: any, options?: {discardChanges?: boolean; reason?: string}): void;

		setEditable(value: boolean): void;

		setDraggable(value: boolean): void;

		setCursor(value: boolean): void;

		setImmediateUpdate(value: boolean): void;

		setDirty(dirty: boolean, options?: {reason?: string}): void;

		setEditMode(editMode: boolean, options?: {reason?: string}): void;

		setHorizontalAlignment(value: Self.GridCell.HorizontalAlignment): void;

		setVerticalAlignment(value: Self.GridCell.VerticalAlignment): void;

		setPhysicalIndex(index: (number | null)): void;

		setPhysicalPosition(first: boolean, last: boolean): void;

		setColumnOverlap(columnOverlap: number): void;

		setInformativeIcon(icon: (Self.Image | null)): void;

		setHelperButtons(definition: (globalThis.Array<Self.GridCell.HelperButton> | globalThis.Array<Self.Button>)): void;

		setShowRangeResizer(value: boolean): void;

		compareValues(oldValue: any, newValue: any): boolean;

		validateValue(args?: {currentValue?: any; newValue?: any; reason?: any}): Self.GridCell.ValidationResult;

		autoSize(options?: {width?: boolean; height?: boolean}): void;

		autoSizeWidth(): void;

		createOverlay(options: object): Self.GridOverlay;

		layout(layout: {left: number; width: number; height: number}): void;

		getCopyValue(): string;

		protected _renderView(): void;

		protected _renderEdit(): void;

		protected _eraseView(): void;

		protected _eraseEdit(): void;

		protected _updateView(): void;

		protected _updateEdit(): void;

		static Event: Self.GridCell.EventTypes;

		static RefProperty: string;

	}

	export namespace GridCell {
		interface Options extends PackageCore.Component.Options {
			row: Self.GridRow;

			column: Self.GridColumn;

			rowOverlap?: number;

			userData?: object;

			value?: any;

			horizontalAlignment?: Self.GridCell.HorizontalAlignment;

			verticalAlignment?: Self.GridCell.VerticalAlignment;

			inputMode?: Self.DataGrid.InputMode;

			comparator?: (left: any, right: any) => boolean;

			dirty?: boolean;

			draggable?: boolean;

			editable?: boolean;

			immediateUpdate?: boolean;

			editMode?: boolean;

			icon?: Self.Image;

			showStatusIcon?: boolean;

			helperButtons?: (globalThis.Array<Self.GridCell.HelperButton> | globalThis.Array<Self.Button>);

			showHelperButtonsInViewMode?: boolean;

		}

		type WidgetOptionsCallback<T> = (args: {cell: Self.GridCell; external: boolean; columnOptions: T}) => T;

		type ValidatorCallback = (args: {cell: Self.GridCell; currentValue: any; newValue: any}, reason: string, setValid: Self.GridCell.SetValidCallback, discardChanges: () => void, reject: () => void) => void;

		type SetValidCallback = (valid: boolean, options?: {message?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element); reason?: string}) => void;

		interface EventTypes extends PackageCore.Component.EventTypes {
			VALUE_CHANGED: string;

			DIRTY_CHANGED: string;

			MODE_CHANGED: string;

			EFFECTIVE_DRAGGABLE_CHANGED: string;

			EFFECTIVE_EDITABLE_CHANGED: string;

		}

		interface HelperButton {
			icon: Self.Image.Source;

			label: (string | PackageCore.Translation);

			action: Self.Button.ActionCallback;

		}

		interface ValidationResult {
			status: Self.GridCell.Status;

			message: (undefined | null | string | PackageCore.Translation);

			reject: boolean;

		}

		export import InputMode = Self.GridConstants.InputMode;

		export import Status = PackageCore.Component.Status;

		enum ValueChangeReason {
			ACCEPT,
			INPUT,
		}

		export import VerticalAlignment = Self.GridConstants.VerticalAlignment;

		export import HorizontalAlignment = Self.GridConstants.HorizontalAlignment;

	}

	class GridCellRange {
		constructor(startCell: Self.GridCell, endCell: Self.GridCell);

		start: Self.GridCell;

		end: Self.GridCell;

		dragStart: (Self.GridCell | null);

		equals(range: (Self.GridCellRange | null)): boolean;

		visit(callback: Self.GridCellRange.VisitCallback): void;

	}

	namespace GridCellRange {
		type VisitCallback = (cell: Self.GridCell, args: {rowIndex: number; columnIndex: number; startRow: boolean; endRow: boolean; startColumn: boolean; endColumn: boolean}) => void;

	}

	export class GridColumn implements PackageCore.EventSource {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options: Self.GridColumn.Options);

		type: Self.DataGrid.ColumnType;

		name: string;

		userData: object;

		width: number;

		minWidth: number;

		maxWidth: number;

		manualWidth: boolean;

		stretchFactor: number;

		stretchable: boolean;

		effectiveStretchable: boolean;

		visible: boolean;

		effectiveVisible: boolean;

		draggable: boolean;

		effectiveDraggable: boolean;

		resizable: boolean;

		effectiveResizable: boolean;

		editable: boolean;

		effectiveEditable: boolean;

		immediateUpdate: boolean;

		level: number;

		label: (string | PackageCore.Translation);

		binding: (string | object);

		binder: object;

		index: number;

		section: Self.DataGrid.ColumnSection;

		physicalIndex: number;

		parentColumn: (Self.GridColumn | null);

		rootColumn: Self.GridColumn;

		childColumns: globalThis.Array<Self.GridColumn>;

		childCount: number;

		visibleChildColumns: globalThis.Array<Self.GridColumn>;

		dataGrid: Self.DataGrid;

		horizontalAlignment: Self.GridColumn.HorizontalAlignment;

		verticalAlignment: Self.GridColumn.VerticalAlignment;

		headerHorizontalAlignment: Self.GridColumn.HorizontalAlignment;

		headerVerticalAlignment: Self.GridColumn.VerticalAlignment;

		classList: PackageCore.HtmlClassList;

		headerClassList: PackageCore.HtmlClassList;

		leafCount: number;

		visibleLeafCount: number;

		leaf: boolean;

		effectiveLeaf: boolean;

		enabled: boolean;

		effectiveEnabled: boolean;

		headerCell: Self.GridHeaderCell;

		userMinWidth: number;

		userMaxWidth: number;

		sortable: boolean;

		effectiveSortable: boolean;

		sortDirection: (Self.DataGrid.SortDirection | null);

		sortOrder: (number | null);

		sortDefault: boolean;

		menu: (globalThis.Array<object> | ((column: Self.GridColumn) => globalThis.Array<object>));

		inputMode: Self.GridColumn.InputMode;

		comparator: (((left: any, right: any) => boolean) | null);

		validator: (Self.GridCell.ValidatorCallback | null);

		showStatusIcon: boolean;

		helperButtons: (Self.GridColumn.HelperButtonProvider | null);

		helperButtonMode: Self.GridColumn.HelperButtonMode;

		headerHelperButtons: (globalThis.Array<Self.Button> | globalThis.Array<Self.GridCell.HelperButton>);

		headerHelperButtonMode: Self.GridColumn.HelperButtonMode;

		mandatory: boolean;

		searchable: boolean;

		searchPredicate: (Self.GridColumn.SearchPredicateCallback | null);

		sortComparatorProvider: (Self.GridColumn.SortComparatorProviderCallback | null);

		visibility: (Self.GridColumn.VisibilityBreakpoint | null);

		createCell(args: object): Self.GridCell;

		createHeaderCell(args: any): Self.GridHeaderCell;

		refreshCells(): void;

		reloadCells(): void;

		addColumn(columnDefinition: (Self.DataGrid.ColumnDefinition | Self.GridColumn), options?: {index?: number; reason?: string}): Self.GridColumn;

		addColumns(columnDefinitions: (globalThis.Array<Self.DataGrid.ColumnDefinition> | globalThis.Array<Self.GridColumn>), options?: {index?: number; reason?: string}): globalThis.Array<Self.GridColumn>;

		removeColumn(id: (string | Self.GridColumn), options?: {reason?: string}): Self.GridColumn;

		removeColumns(index: number, count: number, options?: {reason?: string}): globalThis.Array<Self.GridColumn>;

		removeAll(options?: {reason?: string}): globalThis.Array<Self.GridColumn>;

		moveColumn(columnId: (string | Self.GridColumn), targetParent: Self.GridColumn, options?: {index?: number; reason?: string}): Self.GridColumn;

		moveColumns(index: number, count: number, targetParent: Self.GridColumn, options?: {index?: number; reason?: string}): globalThis.Array<Self.GridColumn>;

		findColumn(id: (string | number | ((column: Self.GridColumn) => boolean) | Self.GridColumn), deep?: boolean): (Self.GridColumn | null);

		setVisible(visible: boolean): void;

		setEnabled(value: boolean): void;

		setEditable(value: boolean): void;

		setDraggable(value: boolean): void;

		setResizable(value: boolean): void;

		setSortable(value: boolean): void;

		setImmediateUpdate(value: boolean): void;

		setLabel(label: (string | PackageCore.Translation)): void;

		setWidth(width: number, args?: {reason?: string}): void;

		setHorizontalAlignment(value: Self.GridColumn.HorizontalAlignment): void;

		setVerticalAlignment(value: Self.GridColumn.HorizontalAlignment): void;

		setHeaderHorizontalAlignment(value: Self.GridColumn.HorizontalAlignment): void;

		setHeaderVerticalAlignment(value: Self.GridColumn.HorizontalAlignment): void;

		setHeaderHelperButtons(buttons: (globalThis.Array<Self.Button> | globalThis.Array<Self.GridCell.HelperButton>)): void;

		getFlatColumns(): globalThis.Array<Self.GridColumn>;

		getLeafColumns(): globalThis.Array<Self.GridColumn>;

		getVisibleLeafColumns(): globalThis.Array<Self.GridColumn>;

		visit(callback: (column: Self.GridColumn) => (boolean | null), self?: boolean): void;

		visitUp(callback: (column: Self.GridColumn) => (boolean | null)): void;

		visitCells(callback: (cell: Self.GridCell) => void): void;

		visitDataCells(callback: (cell: Self.GridCell) => void): void;

		unboxValue(row: Self.GridRow, value: any): any;

		boxValue(row: Self.GridRow, value: any): any;

		autoSize(options?: {width?: boolean; height?: boolean}): void;

		autoSizeWidth(): void;

		createOverlay(options: object): Self.GridOverlay;

		setSortDirection(direction: Self.DataGrid.SortDirection, options?: {reason?: string}): void;

		setSortOrder(order: number, options?: {reason?: string}): void;

		setSortDefault(value: boolean, options?: {reason?: string}): void;

		setMenu(menu: (globalThis.Array<object> | ((column: Self.GridColumn) => globalThis.Array<object>))): void;

		private _onCreateCell(args: object): Self.GridCell;

		static registerColumnFactory(type: string, factory: {createInstance: (options: object) => Self.GridColumn}): void;

		static getColumnFactory(type: string): void;

		static instantiateColumn(type: string, args: Self.GridColumn.Options): Self.GridColumn;

		static defaultComparator(cell: Self.GridCell, oldValue: any, newValue: any): boolean;

		static Event: Self.GridColumn.EventTypes;

	}

	export namespace GridColumn {
		interface Options {
			type: Self.DataGrid.ColumnType;

			name: string;

			binding?: (string | object);

			label?: (string | PackageCore.Translation);

			dataGrid?: Self.DataGrid;

			userData?: object;

			width?: number;

			stretchFactor?: number;

			level?: number;

			horizontalAlignment?: Self.GridColumn.HorizontalAlignment;

			verticalAlignment?: Self.GridColumn.VerticalAlignment;

			headerHorizontalAlignment?: Self.GridColumn.HorizontalAlignment;

			headerVerticalAlignment?: Self.GridColumn.VerticalAlignment;

			minWidth?: number;

			maxWidth?: number;

			userMinWidth?: number;

			userMaxWidth?: number;

			sortable?: boolean;

			sortDirection?: Self.DataGrid.SortDirection;

			sortOrder?: number;

			sortDefault?: boolean;

			inputMode?: Self.DataGrid.InputMode;

			menu?: (globalThis.Array<object> | ((column: Self.GridColumn) => globalThis.Array<object>));

			comparator?: (left: any, right: any) => boolean;

			validator?: Self.GridCell.ValidatorCallback;

			customizeCell?: Self.GridColumn.CustomizeCellCallback;

			customizeHeaderCell?: (cell: Self.GridHeaderCell) => void;

			messageFilter?: PackageCore.RoutedMessage.Filter;

			boxValue?: (row: Self.GridDataRow, value: any) => any;

			unboxValue?: (row: Self.GridDataRow, value: any) => any;

			headerContent?: Self.GridHeaderCell.ContentCallback;

			visible?: boolean;

			draggable?: boolean;

			resizable?: boolean;

			editable?: boolean;

			enabled?: boolean;

			immediateUpdate?: boolean;

			classList?: (string | globalThis.Array<string>);

			headerClassList?: (string | globalThis.Array<string>);

			columns?: (globalThis.Array<Self.DataGrid.ColumnDefinition> | globalThis.Array<Self.GridColumn>);

			showStatusIcon?: boolean;

			helperButtons?: Self.GridColumn.HelperButtonProvider;

			helperButtonMode?: boolean;

			headerHelperButtons?: (globalThis.Array<Self.Button> | globalThis.Array<Self.GridCell.HelperButton>);

			headerHelperButtonMode?: boolean;

			searchable?: boolean;

			searchPredicate?: Self.GridColumn.SearchPredicateCallback;

			sortComparatorProvider?: Self.GridColumn.SortComparatorProviderCallback;

			visibility?: Self.GridColumn.VisibilityBreakpoint;

			on?: PackageCore.EventSource.ListenerMap;

		}

		type WidgetOptionsCallback<T> = (args: {cell: Self.GridCell; external: boolean; columnOptions: T}) => T;

		type HelperButtonProvider = (cell: Self.GridCell) => (globalThis.Array<Self.GridCell.HelperButton> | globalThis.Array<Self.Button>);

		type SearchPredicateCallback = (args: Self.GridColumn.SearchPredicateCallbackArgs) => boolean;

		interface SearchPredicateCallbackArgs {
			column: Self.GridColumn;

			dataItem: any;

			value: any;

			phrase: string;

		}

		type SortComparatorProviderCallback = (args: Self.GridColumn.SortComparatorProviderCallbackArgs) => PackageCore.Comparator.Function;

		interface SortComparatorProviderCallbackArgs {
			column: Self.GridColumn;

			direction: Self.GridColumn.SortDirection;

		}

		type CustomizeCellCallback = (cell: Self.GridCell, args: Self.GridColumn.CustomizeCellCallbackArgs) => void;

		interface CustomizeCellCallbackArgs {
			column: Self.GridColumn;

			row: Self.GridDataRow;

		}

		interface EventTypes {
			COLUMNS_ADDED: string;

			COLUMNS_REMOVED: string;

			COLUMNS_MOVED: string;

			RESIZED: string;

			SHOWN: string;

			EFFECTIVE_ENABLED_CHANGED: string;

			EFFECTIVE_EDITABLE_CHANGED: string;

			CLASS_LIST_CHANGED: string;

			LABEL_CHANGED: string;

			SORT_DIRECTION_CHANGED: string;

			SORT_ORDER_CHANGED: string;

			SORT_DEFAULT_CHANGED: string;

			CELL_UPDATE: string;

		}

		export import InputMode = Self.GridConstants.InputMode;

		export import HelperButtonMode = Self.GridConstants.HelperButtonMode;

		export import VerticalAlignment = Self.GridConstants.VerticalAlignment;

		export import HorizontalAlignment = Self.GridConstants.HorizontalAlignment;

		export import SortDirection = Self.GridConstants.SortDirection;

		enum VisibilityBreakpoint {
			XX_SMALL,
			X_SMALL,
			SMALL,
			MEDIUM,
			LARGE,
			X_LARGE,
		}

		enum Width {
			AUTO,
			DEFAULT,
		}

	}

	export namespace GridColumnDataExchange {
	}

	class GridColumnFactory {
		constructor();

		registerColumn(type: string, factory: {createInstance: (options: object) => Self.GridColumn}): void;

		getFactory(type: string): {createInstance: (options: object) => Self.GridColumn};

		instantiateColumn(type: string, args: object): (Self.GridColumn | null);

		clear(): void;

	}

	namespace GridColumnFactory {
	}

	namespace GridConstants {
		enum RowSection {
			HEADER,
			BODY,
			FOOTER,
		}

		enum ColumnSection {
			LEFT,
			BODY,
			RIGHT,
		}

		enum InputMode {
			DEFAULT,
			EDIT_ONLY,
		}

		enum HelperButtonMode {
			EDIT_ONLY,
			VIEW_ONLY,
			ALWAYS,
		}

		enum HorizontalAlignment {
			LEFT,
			CENTER,
			RIGHT,
			STRETCH,
		}

		enum VerticalAlignment {
			TOP,
			CENTER,
			BOTTOM,
			STRETCH,
		}

		enum SortDirection {
			NONE,
			ASCENDING,
			DESCENDING,
		}

		enum ColumnType {
			ACTION,
			CHECK_BOX,
			DROPDOWN,
			DATE_PICKER,
			TIME_PICKER,
			GRAB,
			LINK,
			TEMPLATED,
			TEXT_AREA,
			TEXT_BOX,
			TREE,
			DETAIL,
			MULTI_SELECT_DROPDOWN,
			SELECTION,
		}

		enum CursorUpdateReason {
			CALL,
			KEYPRESS,
			CLICK,
		}

	}

	export namespace GridDataExchange {
		export import Column = Self.GridColumnDataExchange;

		export import Row = Self.GridRowDataExchange;

	}

	export class GridDataRow extends Self.GridMasterRow {
		constructor(options?: Self.GridDataRow.Options);

		dataStoreEntry: PackageCore.DataStoreEntry;

		dataItem: any;

		dataBound: boolean;

		loaded: boolean;

		loading: boolean;

		dirty: boolean;

		childRowHint: (boolean | null);

		commit(options: {reason?: string}): void;

		rollback(options: {reason?: string}): void;

		setDirty(dirty: boolean, options?: {reason?: string}): void;

		attachDataItemListener(observedItem: any, listener: (args: PackageCore.PropertyObservable.EventArgs, sender: any) => void): void;

		detachDataItemListener(): void;

		load(): globalThis.Promise<any>;

		loadAll(): globalThis.Promise<any>;

		expandAll(): globalThis.Promise<any>;

		static Event: Self.GridDataRow.EventTypes;

	}

	export namespace GridDataRow {
		interface Options extends Self.GridMasterRow.Options {
		}

		interface EventTypes extends Self.GridMasterRow.EventTypes {
			COMMITTED: string;

			ROLLBACKED: string;

			DIRTY_CHANGED: string;

			LOADING_STARTED: string;

			LOADING_FINISHED: string;

		}

	}

	export class GridHeaderCell extends Self.GridCell {
		constructor(options?: Self.GridHeaderCell.Options);

		label: (string | PackageCore.Translation);

		mandatory: boolean;

		sortable: boolean;

		sortDirection: (Self.DataGrid.SortDirection | null);

		sortOrder: (number | null);

		sortDefault: boolean;

		resizable: boolean;

		effectiveResizable: boolean;

		verticalAlignment: Self.GridColumn.VerticalAlignment;

		horizontalAlignment: Self.GridColumn.HorizontalAlignment;

		validator: (Self.GridCell.ValidatorCallback | null);

		setLabel(label: (string | PackageCore.Translation)): void;

		setMandatory(value: boolean): void;

		setSortable(sortable: boolean): void;

		setSortDirection(direction: Self.DataGrid.SortDirection): void;

		setSortOrder(order: number): void;

		setSortDefault(value: boolean): void;

		setResizable(value: boolean): void;

	}

	export namespace GridHeaderCell {
		interface Options extends Self.GridCell.Options {
			label?: (string | PackageCore.Translation);

			sortDirection?: Self.DataGrid.SortDirection;

			sortOrder?: number;

			sortDefault?: boolean;

			autoSizeHeight?: boolean;

			mandatory?: boolean;

			sortable?: boolean;

			resizable?: boolean;

			content?: Self.GridHeaderCell.ContentCallback;

		}

		type ContentCallback = (args: {cell: Self.GridHeaderCell; context: object}) => (PackageCore.Component | PackageCore.JSX.Element);

	}

	export class GridHeaderRow extends Self.GridSyntheticRow {
		constructor(options?: Self.GridHeaderRow.Options);

	}

	export namespace GridHeaderRow {
		interface Options extends Self.GridSyntheticRow.Options {
		}

	}

	export interface GridInputController {
		attach(component: PackageCore.Component): void;

		detach(): void;

		reset(): void;

		filterMessage(message: object, result: object): void;

		handleMessage(message: object, result: object): void;

		editCell(cell: Self.GridCell, activate: boolean, reason?: Self.DataGrid.CursorUpdateReason): void;

		startEditing(cell: Self.GridCell, activate?: boolean, reason?: Self.DataGrid.CursorUpdateReason): void;

		closeEditing(focusGrid: boolean, nextEditedCell?: Self.GridCell): void;

		acceptChanges(): void;

		discardChanges(): void;

		handleRowRemoved(row: Self.GridRow): void;

	}

	export namespace GridInputController {
	}

	class GridManualAutoSize {
		constructor();

	}

	namespace GridManualAutoSize {
	}

	export class GridMasterRow extends Self.GridRow {
		constructor(options?: Self.GridMasterRow.Options);

		index: number;

		childRows: globalThis.Array<Self.GridRow>;

		childCount: number;

		expanded: boolean;

		collapsed: boolean;

		insideAboveSyntheticRows: globalThis.Array<Self.GridSyntheticRow>;

		insideBelowSyntheticRows: globalThis.Array<Self.GridSyntheticRow>;

		outsideAboveSyntheticRows: globalThis.Array<Self.GridSyntheticRow>;

		outsideBelowSyntheticRows: globalThis.Array<Self.GridSyntheticRow>;

		hasDetailRow: boolean;

		detailRow: (Self.GridSyntheticRow | null);

		detailVisible: boolean;

		firstPhysicalRowSetRow: Self.GridRow;

		lastPhysicalRowSetRow: Self.GridRow;

		hasPreviousRow: boolean;

		hasNextRow: boolean;

		pinned: boolean;

		addRow(row: Self.GridDataRow, options?: {index?: number; reason?: string}): Self.GridRow;

		addRows(rows: globalThis.Array<Self.GridDataRow>, options?: {index?: number; previousIndex?: number; reason?: string}): void;

		removeRow(row: Self.GridDataRow, options?: {reason?: string}): Self.GridRow;

		removeRows(index: number, count?: number, options?: {reason?: string}): Self.GridRow;

		removeAll(options?: {reason?: string}): void;

		addSyntheticRow(row: Self.GridSyntheticRow, options?: {inside?: boolean; above?: boolean; order?: number; reason?: string}): void;

		removeSyntheticRow(row: Self.GridSyntheticRow, options?: {reason?: string}): void;

		getSyntheticRows(inside: boolean, above: boolean): globalThis.Array<Self.GridSyntheticRow>;

		setDetailRow(row: (Self.GridSyntheticRow | null)): void;

		showDetailRow(value: boolean, options?: {reason?: string}): void;

		toggleDetailRow(): void;

		setExpanded(value: boolean, options: {reason?: string}): void;

		expand(): void;

		collapse(): void;

		visit(callback: (row: Self.GridRow) => (boolean | null), self?: boolean): void;

		visitRowSet(callback: (row: Self.GridRow) => void): void;

		containsRow(row: Self.GridMasterRow): boolean;

		createRowSetOverlay(options: object): Self.GridOverlay;

		static Event: Self.GridMasterRow.EventTypes;

	}

	export namespace GridMasterRow {
		interface Options extends Self.GridRow.Options {
			index?: number;

			expanded?: boolean;

		}

		interface EventTypes extends Self.GridRow.EventTypes {
			ROWS_ADDED: string;

			ROWS_REMOVED: string;

			EXPANDED: string;

			SYNTHETIC_ROW_ADDED: string;

			SYNTHETIC_ROW_REMOVED: string;

			DETAIL_ROW_TOGGLED: string;

		}

	}

	export class GridMultiSelection implements Self.GridSelection {
		constructor(options: object);

		selectedItems: globalThis.Array<any>;

		select(item: any, value: boolean): Self.GridMultiSelection;

		selectAll(items: globalThis.Array<any>, value: boolean): Self.GridMultiSelection;

		isSelected(item: any): boolean;

		static of(items: globalThis.Array<any>): Self.GridMultiSelection;

		static EMPTY: Self.GridMultiSelection;

	}

	export namespace GridMultiSelection {
	}

	class GridMultiSelectionStrategy implements Self.GridSelectionStrategy {
		constructor(options: object);

	}

	namespace GridMultiSelectionStrategy {
	}

	class GridObservingBindingController implements Self.GridBindingController {
		bindRow(row: Self.GridDataRow, options: object): void;

		unbindRow(row: Self.GridDataRow, options: object): void;

		commitRow(row: Self.GridDataRow, options: object): void;

		rollbackRow(row: Self.GridDataRow, options: object): void;

		reloadRow(row: Self.GridDataRow, options: object): void;

		reloadCell(row: Self.GridDataRow, options: object): void;

		getCellParameters(row: Self.GridDataRow, column: Self.GridColumn): void;

		handleCellUpdate(update: object): void;

		updateBindings(rootColumn: Self.GridColumn): void;

	}

	namespace GridObservingBindingController {
	}

	class GridOverlay {
	}

	namespace GridOverlay {
	}

	export class GridPanel extends PackageCore.Component {
		constructor(options?: Self.GridPanel.Options);

		items: globalThis.Array<Self.GridPanelItem>;

		components: globalThis.Array<PackageCore.Component>;

		children: PackageCore.VDom.Children;

		length: number;

		empty: boolean;

		rows: (number | string | globalThis.Array<string>);

		columns: (number | string | globalThis.Array<string>);

		areas: globalThis.Array<Self.GridPanelArea>;

		rowGap: Self.GridPanel.GapSize;

		columnGap: Self.GridPanel.GapSize;

		outerGap: (Self.GridPanel.GapSize | Self.GridPanel.GapSizeObject);

		defaultRowHeight: string;

		defaultColumnWidth: string;

		autoFlow: string;

		decorator: (PackageCore.Decorator | null);

		element: Self.GridPanel.Element;

		defaultItemOptions: Self.GridPanel.ItemProps;

		add(component: (Self.GridPanel.ItemConfiguration | globalThis.Array<Self.GridPanel.ItemConfiguration>)): Self.GridPanel;

		remove(componentOrIndex: (PackageCore.Component | number | globalThis.Array<(PackageCore.Component | number)>)): Self.GridPanel;

		move(args: {component: PackageCore.Component; area?: (string | Self.GridPanelArea.Options | Self.GridPanelArea); index?: number; reason?: string}): Self.GridPanel;

		clear(): Self.GridPanel;

		replace(currentComponent: PackageCore.Component, newComponent: PackageCore.Component): Self.GridPanel;

		has(component: PackageCore.Component): boolean;

		itemForComponent(component: PackageCore.Component): Self.GridPanelItem;

		itemAtIndex(index: number): Self.GridPanelItem;

		getRowHeight(rowIndex: number): string;

		setRowHeight(rowIndex: number, rowHeight?: string): Self.GridPanel;

		getColumnWidth(columnIndex: number): string;

		setColumnWidth(columnIndex: number, columnWidth?: string): Self.GridPanel;

		setRowGap(value: Self.GridPanel.GapSize): void;

		setColumnGap(value: Self.GridPanel.GapSize): void;

		setOuterGap(value: Self.GridPanel.GapSize): void;

		addArea(area: (Self.GridPanelArea | object)): void;

		removeArea(area: (Self.GridPanelArea | string)): void;

		hasArea(name: string): boolean;

		getArea(name: string): Self.GridPanelArea;

		setAutoFlow(value: string): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		static Event: Self.GridPanel.EventTypes;

		static Item(props?: Self.GridPanel.JsxItemProps): PackageCore.JSX.Element;

	}

	export namespace GridPanel {
		interface BaseItemProps {
			alignment?: Self.GridPanel.Alignment;

			justification?: Self.GridPanel.Justification;

			area?: (string | Self.GridPanelArea);

			columnIndex?: (number | null);

			columnSpan?: number;

			rowIndex?: (number | null);

			rowSpan?: number;

			horizontalShrink?: boolean;

			verticalShrink?: boolean;

		}

		interface ItemProps extends Self.GridPanel.BaseItemProps {
		}

		interface JsxItemProps extends Self.GridPanel.BaseItemProps {
			children?: PackageCore.VDom.Children;

			key?: any;

		}

		interface StructuredItemConfiguration {
			component: PackageCore.Component;

			options?: Self.GridPanel.ItemProps;

		}

		interface FlatItemConfiguration extends Self.GridPanel.ItemProps {
			component: PackageCore.Component;

		}

		type ItemConfiguration = (PackageCore.Component | Self.GridPanel.StructuredItemConfiguration | Self.GridPanel.FlatItemConfiguration);

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

			ITEM_MOVED: string;

		}

		interface GapSizeObject {
			top?: Self.GridPanel.GapSize;

			bottom?: Self.GridPanel.GapSize;

			start?: Self.GridPanel.GapSize;

			end?: Self.GridPanel.GapSize;

			horizontal?: Self.GridPanel.GapSize;

			vertical?: Self.GridPanel.GapSize;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			areas?: globalThis.Array<(Self.GridPanelArea | Self.GridPanelArea.Options)>;

			autoFlow?: AutoFlow;

			columns?: (number | string | globalThis.Array<string>);

			decorator?: PackageCore.Decorator;

			defaultColumnWidth?: string;

			defaultItemOptions?: Self.GridPanel.ItemProps;

			defaultRowHeight?: string;

			items?: (Self.GridPanel.ItemConfiguration | globalThis.Array<Self.GridPanel.ItemConfiguration>);

			outerGap?: (Self.GridPanel.GapSize | Self.GridPanel.GapSizeObject);

			columnGap?: Self.GridPanel.GapSize;

			rowGap?: Self.GridPanel.GapSize;

			gap?: Self.GridPanel.GapSize;

			element?: Self.GridPanel.Element;

			rows?: (number | string | globalThis.Array<string>);

		}

		export import Justification = Self.GridPanelItem.Justification;

		export import Alignment = Self.GridPanelItem.Alignment;

		export import GapSize = Self.GapSize;

		enum AutoFlow {
			ROW,
			ROW_DENSE,
			COLUMN,
			COLUMN_DENSE,
		}

		enum VisualStyle {
			BLOCK,
			INLINE,
		}

		export import Decorator = PackageCore.Decorator;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class GridPanelArea {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options: Self.GridPanelArea.Options);

		name: (string | null);

		rowIndex: (number | null);

		columnIndex: (number | null);

		rowSpan: number;

		columnSpan: number;

		setRowIndex(rowIndex: number): void;

		setColumnIndex(columnIndex: number): void;

		setRowSpan(rowSpan: number): void;

		setColumnSpan(columnSpan: number): void;

		static from(definition: (Self.GridPanelArea.Options | Self.GridPanelArea)): Self.GridPanelArea;

	}

	export namespace GridPanelArea {
		interface Options {
			name: string;

			columnIndex?: (number | null);

			columnSpan?: number;

			rowIndex?: (number | null);

			rowSpan?: number;

		}

	}

	export class GridPanelItem {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options: Self.GridPanelItem.Options);

		component: PackageCore.Component;

		rowIndex: number;

		columnIndex: number;

		rowSpan: number;

		columnSpan: number;

		justification: Self.GridPanelItem.Justification;

		alignment: Self.GridPanelItem.Alignment;

		verticalShrink: boolean;

		horizontalShrink: boolean;

		area: Self.GridPanelArea;

		setRowIndex(rowIndex: number): void;

		setColumnIndex(columnIndex: number): void;

		setRowSpan(rowSpan: number): void;

		setColumnSpan(columnSpan: number): void;

		setJustification(justification: Self.GridPanelItem.Justification): void;

		setAlignment(alignment: Self.GridPanelItem.Alignment): void;

		setVerticalShrink(verticalShrink: boolean): void;

		setHorizontalShrink(horizontalShrink: boolean): void;

		setArea(area: Self.GridPanelArea): void;

		static Event: Self.GridPanelItem.EventTypes;

	}

	export namespace GridPanelItem {
		interface Options {
			component: PackageCore.Component;

			alignment?: Self.GridPanelItem.Alignment;

			area: Self.GridPanelArea;

			horizontalShrink?: boolean;

			justification?: Self.GridPanel.Justification;

			verticalShrink?: boolean;

		}

		interface EventTypes {
			POSITION_CHANGED: string;

		}

		enum Justification {
			START,
			CENTER,
			END,
			STRETCH,
		}

		enum Alignment {
			START,
			CENTER,
			END,
			STRETCH,
		}

	}

	export class GridPortlet extends PackageCore.Component {
		constructor(options?: Self.GridPortlet.Options);

	}

	export namespace GridPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	class GridRangeSelectionFilter implements PackageCore.MessageHandler {
		constructor(options: {dispatcher: PackageCore.PageMessageDispatcher; dataGrid: Self.DataGrid; cell: Self.GridCell; selecting: boolean});

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	namespace GridRangeSelectionFilter {
	}

	class GridRangeSelectionRemovalFilter implements PackageCore.MessageHandler {
		constructor(options: {dispatcher: PackageCore.PageMessageDispatcher; dataGrid: Self.DataGrid});

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	namespace GridRangeSelectionRemovalFilter {
	}

	class GridResizer extends PackageCore.Component {
		constructor(options?: Self.GridResizer.Options);

	}

	namespace GridResizer {
		interface Options extends PackageCore.Component.Options {
			orientation?: Self.GridResizer.Orientation;

			startResize?: (position: object) => void;

		}

		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

	}

	export class GridRow implements PackageCore.EventSource {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options: Self.GridRow.Options);

		guid: string;

		section: Self.DataGrid.RowSection;

		physicalIndex: (number | null);

		userData: object;

		enabled: boolean;

		effectiveEnabled: boolean;

		draggable: boolean;

		effectiveDraggable: boolean;

		resizable: boolean;

		effectiveResizable: boolean;

		editable: boolean;

		effectiveEditable: boolean;

		dataGrid: (Self.DataGrid | null);

		height: (number | null);

		heightType: Self.GridRow.Height;

		minHeight: number;

		maxHeight: number;

		manualHeight: boolean;

		parentRow: (Self.GridRow | null);

		cells: globalThis.Map<Self.GridColumn, Self.GridCell>;

		level: number;

		valid: boolean;

		status: Self.GridRow.Status;

		showBorder: boolean;

		cellConfiguration: (row: Self.GridRow, column: Self.GridColumn) => (Self.GridCell | null);

		rootAttributes: PackageCore.HtmlAttributeList;

		classList: PackageCore.HtmlClassList;

		cellLayout: {left: globalThis.Array<Self.GridRow.CellLayout>; body: globalThis.Array<Self.GridRow.CellLayout>; right: globalThis.Array<Self.GridRow.CellLayout>};

		segment: {left: Self.GridRowSegment; body: Self.GridRowSegment; right: Self.GridRowSegment};

		type: Self.GridRow.Type;

		visitUp(callback: (row: Self.GridRow) => (boolean | null)): void;

		getCell(column: (Self.GridColumn | string)): (Self.GridCell | null);

		refresh(): void;

		reload(options: object): void;

		reloadCell(cell: Self.GridCell): void;

		setEnabled(enabled: boolean): void;

		setEditable(value: boolean): void;

		setResizable(value: boolean): void;

		setDraggable(value: boolean): void;

		setShowBorder(value: boolean): void;

		setValid(valid: boolean, options?: {reason?: string}): void;

		setStatus(status: Self.GridRow.Status, options?: {reason?: string}): void;

		setHeight(value: number, args?: {reason?: string}): void;

		autoSize(options?: {width?: boolean; height?: boolean}): void;

		autoSizeWidth(): void;

		applyAutoHeight(): void;

		createOverlay(options: object): Self.GridOverlay;

		openAllCellsForEditing(): void;

		closeAllCellsFromEditing(): void;

		findFirstCell(args?: {predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		findLastCell(args?: {predicate?: (cell: Self.GridCell) => boolean}): (Self.GridCell | null);

		lazyUpdateCell(column: (string | Self.GridColumn), callback: (cell: Self.GridCell) => void): void;

		createSegment(columnSection: Self.DataGrid.ColumnSection): void;

		disposeSegment(columnSection: Self.DataGrid.ColumnSection): void;

		setPhysicalIndex(value: (number | null)): void;

		static Event: Self.GridRow.EventTypes;

	}

	export namespace GridRow {
		interface Options {
			dataGrid: Self.DataGrid;

			parentRow?: Self.GridRow;

			level?: number;

			userData?: object;

			status?: Self.GridRow.Status;

			cellConfiguration: (row: Self.GridRow, column: Self.GridColumn) => (Self.GridCell | null);

			height?: (number | Self.GridRow.Height);

			showBorder?: boolean;

			draggable?: boolean;

			resizable?: boolean;

			editable?: boolean;

			enabled?: boolean;

			classList?: (string | globalThis.Array<string>);

			rootAttributes?: object;

			section?: Self.DataGrid.RowSection;

			on?: PackageCore.EventSource.ListenerMap;

		}

		interface EventTypes {
			RESIZED: string;

			STATUS_CHANGED: string;

			ENABLED_CHANGED: string;

			EFFECTIVE_ENABLED_CHANGED: string;

		}

		interface CellLayout {
			empty?: boolean;

			cell?: Self.GridCell;

			id: number;

		}

		export import Status = PackageCore.Component.Status;

		enum Attribute {
			ROW_ID,
			PARENT_ROW_ID,
			MASTER_ROW_ID,
		}

		enum Type {
			ROW,
			DATA,
			SYNTHETIC,
			HEADER,
		}

		enum Height {
			AUTO,
			FIXED,
			DEFAULT,
		}

	}

	export namespace GridRowDataExchange {
	}

	/**
	 * @deprecated
	 */
	class GridRowEditInputController extends Self.GridSelectEditInputController implements Self.GridInputController {
		constructor();

	}

	namespace GridRowEditInputController {
	}

	class GridRowSegment extends PackageCore.Component {
		constructor(options?: Self.GridRowSegment.Options);

	}

	namespace GridRowSegment {
		interface Options extends PackageCore.Component.Options {
		}

	}

	class GridSegment extends PackageCore.Component {
		constructor();

		virtualization: boolean;

		planUpdate(): void;

	}

	namespace GridSegment {
	}

	class GridSelectEditInputController implements Self.GridInputController {
		constructor(options: Self.GridSelectEditInputController.Options);

		attach(component: PackageCore.Component): void;

		detach(): void;

		reset(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

		handleRowRemoved(row: Self.GridRow): void;

		editCell(cell: Self.GridCell, activate: boolean, reason: Self.DataGrid.CursorUpdateReason): void;

		startEditing(cell: Self.GridCell, activate?: boolean, reason?: Self.DataGrid.CursorUpdateReason): void;

		closeEditing(focusGrid: boolean, nextEditedCell?: Self.GridCell): void;

		acceptChanges(): void;

		discardChanges(): void;

		filterMessage(message: object, result: object): void;

		handleMessage(message: object, result: object): void;

		private _moveRowDown(row: Self.GridDataRow): void;

	}

	namespace GridSelectEditInputController {
		interface Options {
			editingMode?: boolean;

			beforeEditCell?: Self.GridSelectEditInputController.BeforeEditCellCallback;

		}

		type BeforeEditCellCallback = (args: {cell: Self.GridCell; reason: string}) => void;

	}

	export interface GridSelection {
		select(item: any, value: boolean): Self.GridSelection;

		isSelected(item: any): boolean;

	}

	export namespace GridSelection {
		enum Mode {
			ALL,
			PAGE,
		}

		enum ChangeReason {
			SELECTION_UPDATE,
			SELECT_ALL,
		}

	}

	interface GridSelectionStrategy {
	}

	namespace GridSelectionStrategy {
	}

	export class GridSingleSelection implements Self.GridSelection {
		constructor(options: object);

		selectedItem: globalThis.Array<any>;

		select(item: any, value: boolean): Self.GridSingleSelection;

		selectAll(items: globalThis.Array<any>, value: boolean): Self.GridSingleSelection;

		isSelected(item: any): boolean;

		static of(item: any): Self.GridSingleSelection;

		static EMPTY: Self.GridSingleSelection;

	}

	export namespace GridSingleSelection {
	}

	class GridSingleSelectionStrategy implements Self.GridSelectionStrategy {
		constructor();

	}

	namespace GridSingleSelectionStrategy {
	}

	export class GridSyntheticCell extends Self.GridCell {
		constructor(options?: Self.GridSyntheticCell.Options);

	}

	export namespace GridSyntheticCell {
		interface Options extends Self.GridCell.Options {
			content: (Self.GridSyntheticCell.ContentCallback | PackageCore.JSX.Element | PackageCore.Component);

			copyValueProvider?: (cell: Self.GridSyntheticCell) => (string | Element);

		}

		type ContentCallback = (args: {cell: Self.GridSyntheticCell; context: object}) => (PackageCore.Component | PackageCore.JSX.Element);

	}

	export class GridSyntheticRow extends Self.GridRow {
		constructor(options?: Self.GridSyntheticRow.Options);

		masterRow: Self.GridDataRow;

		order: number;

		inside: boolean;

		above: boolean;

	}

	export namespace GridSyntheticRow {
		interface Options extends Self.GridRow.Options {
		}

	}

	namespace GridTask {
	}

	class GridView extends PackageCore.Component {
		constructor();

		rowCount: {header: number; body: number; footer: number};

		rowSize: PackageCore.StaticSizeIndex;

		columnCount: {left: number; body: number; right: number};

		columnSize: PackageCore.StaticSizeIndex;

		viewportSize: {x: number; y: number};

		bodyViewportSize: PackageCore.Scrollable.Size;

		bodyContentSize: PackageCore.Scrollable.Size;

		scrollController: PackageCore.ScrollController;

		scrollOffset: {x: number; y: number};

		scrollability: PackageCore.Scrollable.Scrollability;

		stickySegments: {left: boolean; right: boolean; header: boolean; footer: boolean};

		stickyScrollbars: {horizontal: boolean; vertical: boolean};

		hasPendingUpdates: boolean;

		virtualization: boolean;

		dataLoader: (Self.Loader | null);

		actionBar: (PackageCore.Component | PackageCore.VDomElement | null);

		actionBarHeight: (number | null);

		actionBarVisible: boolean;

		stickyActionBar: boolean;

		placeholder: (PackageCore.Component | PackageCore.VDomElement | null);

		placeholderVisible: boolean;

		static Event: Self.GridView.EventTypes;

	}

	namespace GridView {
		interface EventTypes extends PackageCore.Component.EventTypes {
			WILL_SCHEDULE_UPDATE: string;

			DID_SCHEDULE_UPDATE: string;

			WILL_UPDATE: string;

			DID_UPDATE: string;

			VIEWPORT_RESIZE: string;

			SCROLLABILITY_CHANGED: string;

		}

	}

	export class Group extends PackageCore.Component {
		constructor(options?: Self.Group.Options);

		content: PackageCore.Component;

		setContent(content: PackageCore.Component): void;

	}

	export namespace Group {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: PackageCore.Component;

			role?: Self.Group.Role;

		}

		enum Role {
			GROUP,
			RADIO_GROUP,
		}

	}

	export class GrowlMessage extends PackageCore.Component {
		constructor(options: Self.GrowlMessage.Options);

		title: (string | PackageCore.Translation);

		content: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		children: PackageCore.VDom.Children;

		type: Self.GrowlMessage.Type;

		icon: Self.Image.Source;

		showCloseButton: boolean;

		closeOnClick: boolean;

		expanded: boolean;

		close(): void;

		static Event: Self.GrowlMessage.EventTypes;

	}

	export namespace GrowlMessage {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			title?: (string | PackageCore.Translation);

			content?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			icon?: Self.Image.Source;

			showCloseButton?: boolean;

			closeOnClick?: boolean;

			type?: Self.GrowlMessage.Type;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLOSING: string;

			CLOSED: string;

		}

		export import Type = PackageCore.UserMessageService.MessageType;

		enum I18n {
			COLLAPSE,
			CLOSE,
			EXPAND,
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

	}

	export class GrowlPanel extends PackageCore.Component {
		constructor(options?: Self.GrowlPanel.Options);

		position: (Self.GrowlPanel.Position | null);

		alignment: (Self.GrowlPanel.Alignment | null);

		messages: globalThis.Array<PackageCore.Component>;

		manual: boolean;

		add(message: (Self.GrowlMessage | globalThis.Array<Self.GrowlMessage>)): void;

		remove(message: Self.BannerMessage): void;

		clear(): void;

		setPosition(position: Self.GrowlPanel.Position): void;

		setAlignment(alignment: Self.GrowlPanel.Position): void;

		createUserMessage(message: PackageCore.UserMessageService.MessageOptions): Self.GrowlMessage;

		connect(service: PackageCore.UserMessageService): void;

		disconnect(): void;

	}

	export namespace GrowlPanel {
		interface Options extends PackageCore.Component.Options {
			messages?: globalThis.Array<Self.GrowlMessage>;

			position?: Self.GrowlPanel.Position;

			alignment?: Self.GrowlPanel.Alignment;

			manual?: boolean;

		}

		export import Position = Self.GrowlPanelOptions.Position;

		export import Alignment = Self.GrowlPanelOptions.Alignment;

	}

	namespace GrowlPanelOptions {
		enum Alignment {
			START,
			END,
		}

		enum Position {
			START,
			CENTER,
			END,
		}

	}

	export namespace HeaderNavigationEvent {
	}

	export class Heading extends PackageCore.Component {
		constructor(options?: Self.Heading.Options);

		content: Self.Heading.Content;

		children: PackageCore.VDom.Children;

		type: Self.Heading.Type;

		kind: (Self.Heading.Kind | null);

		weight: (Self.Heading.Weight | null);

		size: (Self.Heading.Size | null);

		level: (number | null);

		inline: boolean;

		setType(type: Self.Heading.Type): void;

		setKind(kind: (Self.Heading.Kind | null)): void;

		setWeight(weight: (Self.Heading.Weight | null)): void;

		setSize(size: (Self.Heading.Size | null)): void;

		setLevel(level: (number | null)): void;

		setContent(content: Self.Heading.Content): void;

		setInline(inline: boolean): void;

	}

	export namespace Heading {
		type Content = (null | string | number | PackageCore.Component | PackageCore.JSX.Element | PackageCore.Translation);

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: Self.Heading.Content;

			inline?: boolean;

			kind?: Self.Heading.Kind;

			level?: number;

			size?: Self.Heading.Size;

			type?: Self.Heading.Type;

			weight?: Self.Heading.Weight;

		}

		enum Type {
			PAGE_TITLE,
			PAGE_SUBTITLE,
			LARGE_HEADING,
			MEDIUM_HEADING,
			SMALL_HEADING,
		}

		enum Kind {
			PAGE,
			CONTENT,
		}

		enum Weight {
			DISPLAY,
			HEADING,
			SUBHEADING,
		}

		enum Size {
			XS,
			S,
			M,
			L,
			XL,
			XXL,
		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
		}

	}

	export class HelpCenterService {
		constructor(options?: Self.HelpCenterService.Options);

		setTopicId(topicId: string): void;

		openHelpTopic(taskId?: string): void;

	}

	export namespace HelpCenterService {
		interface Options {
			taskId?: string;

		}

	}

	export class HelpService {
		constructor(options?: Self.HelpService.Options);

		getFieldLevelHelp(options: Self.HelpService.FieldLevelHelpOptions & {owner: (PackageCore.Component | PackageCore.VDomRef)}): globalThis.Promise<Self.HelpService.FieldLevelHelp>;

	}

	export namespace HelpService {
		interface Options {
			showInternalId: boolean;

			taskId: string;

		}

		interface FieldLevelHelp {
			show: () => void;

		}

		interface FieldLevelHelpOptions {
			fieldId: string;

			parentId?: string;

			variantId?: string;

			isEdit?: boolean;

		}

	}

	class Host {
		constructor(options?: {root?: HTMLElement; context?: object});

		root: HTMLElement;

		running: boolean;

		context: object;

		run(options?: {waitDocumentReady?: boolean}): globalThis.Promise<any>;

		render(element: (PackageCore.Component | PackageCore.JSX.Element), container?: HTMLElement, options?: {contextPortal?: PackageCore.Component}): Self.Host.RootHandle;

		erase(): void;

		dispose(): void;

		getContext(type: string): any;

		setContext(type: (string | Record<string, any>), value: any): void;

		static page(options?: {context?: object}): Self.Host;

		static testPage(options?: {context?: object}): Self.Host;

		static context(types?: object): object;

		static testContext(types?: object): object;

	}

	namespace Host {
		interface RootHandle {
			render: (element: PackageCore.JSX.Element) => void;

			dispose: () => void;

		}

	}

	export class HtmlWrapper extends PackageCore.Component {
		constructor(options?: (Self.HtmlWrapper.ContentProvider | Self.HtmlWrapper.Options));

		content: Self.HtmlWrapper.ContentProvider;

		refresh(): void;

		static ofElement(element: HTMLElement, options?: Self.HtmlWrapper.Options): Self.HtmlWrapper;

		static ofVDom(element: PackageCore.JSX.Element, options?: Self.HtmlWrapper.Options): Self.HtmlWrapper;

		static ofHtmlString(string: string, options?: Self.HtmlWrapper.Options): Self.HtmlWrapper;

	}

	export namespace HtmlWrapper {
		type ContentProvider = () => (HTMLElement | PackageCore.JSX.Element | PackageCore.Component);

		interface Options extends PackageCore.Component.Options {
			content?: Self.HtmlWrapper.ContentProvider;

		}

	}

	export class IFrame extends PackageCore.Component {
		constructor(options?: Self.IFrame.Options);

		url: string;

		loaded: boolean;

		content: Self.Window;

		onLoad: Self.IFrame.LoadCallback;

		onUnload: Self.IFrame.UnloadCallback;

	}

	export namespace IFrame {
		interface Options extends PackageCore.Component.Options {
			url?: string;

			onLoad?: Self.IFrame.LoadCallback;

			onUnload?: Self.IFrame.UnloadCallback;

		}

		type LoadCallback = () => void;

		type UnloadCallback = () => void;

	}

	export class Image extends PackageCore.Component {
		constructor(options?: (Self.Image.Options | string | PackageCore.ImageMetadata));

		image: Self.Image.Source;

		presentation: boolean;

		scalable: boolean;

		size: Self.Image.SizeDefinition;

		borderRadius: Self.Image.BorderRadius;

		color: (Self.Image.Color | null);

		colorStrength: (Self.Image.ColorStrength | null);

		setImage(image: Self.Image.Source): void;

		setSize(size: Self.Image.SizeDefinition): void;

		setBorderRadius(borderRadius: Self.Image.BorderRadius): void;

		setPresentation(presentation: boolean): void;

		setScalable(scalable: boolean): void;

	}

	export namespace Image {
		interface SizeObject {
			height: (number | string);

			width: (number | string);

		}

		type SizeDefinition = (Self.Image.Size | Self.Image.SizeObject | string | number);

		type Source = (string | PackageCore.Url | PackageCore.ImageMetadata.Options | PackageCore.ImageMetadata);

		interface Options extends PackageCore.Component.Options {
			borderRadius?: Self.Image.BorderRadius;

			image: Self.Image.Source;

			presentation?: boolean;

			scalable?: boolean;

			size?: Self.Image.SizeDefinition;

			color?: Self.Image.Color;

			colorStrength?: Self.Image.ColorStrength;

		}

		export import Size = PackageCore.ImageConstant.Size;

		export import BorderRadius = PackageCore.ImageConstant.BorderRadius;

		export import Color = PackageCore.ImageConstant.Color;

		export import ColorStrength = PackageCore.ImageConstant.ColorStrength;

	}

	class InlineEditor extends PackageCore.Component {
		constructor(options: Self.InlineEditor.Options);

		isEditing: boolean;

		readOnly: boolean;

		text: (string | PackageCore.Translation);

		textValidator: (Self.InlineEditor.TextValidatorCallback | null);

		textBox: (Self.TextBox | null);

		invalidIcon: Self.Image;

		invalidIconOptions: object;

		startEditing(args?: object): void;

		finishEditing(args?: object): void;

		setText(text: (string | PackageCore.Translation), options?: object): void;

		private _validate(validator: (Self.InlineEditor.TextValidatorCallback | null), options: object): boolean;

		private _handleInputTextChanged(args: Self.TextBox.TextChangedArgs): void;

		private _handleInputValidityChanged(args: object): void;

		static Event: Self.InlineEditor.EventTypes;

	}

	namespace InlineEditor {
		interface Options extends PackageCore.Component.Options {
			acceptInvalidValue?: boolean;

			createLabel?: (args: {text: string}) => PackageCore.JSX.Element;

			inputSize?: (number | null);

			keyValidator?: Self.TextBox.KeyValidatorCallback;

			readOnly?: boolean;

			text?: string;

			textValidator?: Self.InlineEditor.TextValidatorCallback;

			invalidIconOptions?: object;

		}

		type TextValidatorCallback = (args: Self.InlineEditor.TextValidatorArgs) => boolean;

		interface TextValidatorArgs {
			text: string;

			previousText: string;

			reason: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TEXT_CHANGED: string;

			EDITING_STARTED: string;

			EDITING_FINISHED: string;

		}

		enum VisualStyle {
			EMBEDDED,
		}

		enum Reason {
			CALL,
			CANCEL,
			CLICK,
			KEY_ENTER,
			KEY_ESCAPE,
			FOCUS_OUT,
			TEXT_SYNC,
		}

	}

	export enum InputSize {
		AUTO,
		XXS,
		XS,
		S,
		M,
		L,
		XL,
		XXL,
	}

	export class Kpi extends PackageCore.Component {
		constructor(options?: Self.Kpi.Options);

		color: Self.Kpi.Color;

		title: (string | number | PackageCore.Translation);

		value: (string | number | PackageCore.Translation);

		trend: Self.Kpi.Trend;

		justification: Self.Kpi.Justification;

	}

	export namespace Kpi {
		interface Trend {
			value: (string | number | PackageCore.Translation);

			description: (string | number | PackageCore.Translation);

			direction: Self.Kpi.TrendDirection;

		}

		interface Options extends PackageCore.Component.Options {
			color?: Self.Kpi.Color;

			title?: (string | number | PackageCore.Translation);

			value?: (string | number | PackageCore.Translation);

			trend?: Self.Kpi.Trend;

			justification?: Self.Kpi.Justification;

		}

		enum Color {
			NONE,
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			THEMED,
		}

		enum TrendDirection {
			POSITIVE,
			NEGATIVE,
		}

		enum Justification {
			START,
			CENTER,
			END,
		}

	}

	export class KpiPortlet extends PackageCore.Component {
		constructor(options?: Self.KpiPortlet.Options);

	}

	export namespace KpiPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class Label extends PackageCore.Component {
		constructor(options?: Self.Label.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		children: PackageCore.VDom.Children;

		for: (PackageCore.Component | PackageCore.VDomRef | string);

		wrap: (boolean | number);

		whitespace: boolean;

		clickHandler: (Self.Label.ClickHandler | null);

		ellipsisHelper: Self.EllipsisTooltip;

		setLabel(label: (null | string | number | PackageCore.Translation | PackageCore.Component)): void;

		setFor(value: (PackageCore.Component | PackageCore.VDomRef | string)): void;

	}

	export namespace Label {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			clickHandler?: Self.Label.ClickHandler;

			for?: (string | PackageCore.VDomRef | PackageCore.Component);

			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			whitespace?: boolean;

			wrap?: (boolean | number);

		}

		type ClickHandler = (target: (PackageCore.Component | null), message: PackageCore.PointerMessage, label: Self.Label) => boolean;

		enum VisualStyle {
			STANDALONE,
			BUTTON,
			EMBEDDED,
			GRID_HEADER,
		}

	}

	export class LazyPanel extends PackageCore.Component {
		constructor(options?: Self.LazyPanel.Options);

		content: (PackageCore.Component | PackageCore.JSX.Element | null);

		element: Self.LazyPanel.Element;

		horizontalAlignment: Self.LazyPanel.HorizontalAlignment;

		verticalAlignment: Self.LazyPanel.VerticalAlignment;

		outerGap: (Self.LazyPanel.GapSize | Self.LazyPanel.GapSizeObject);

		decorator: (PackageCore.Decorator | null);

		children: PackageCore.VDom.Children;

		setContent(content: (PackageCore.Component | PackageCore.JSX.Element | null)): void;

		setHorizontalAlignment(value: Self.LazyPanel.HorizontalAlignment): void;

		setVerticalAlignment(value: Self.LazyPanel.VerticalAlignment): void;

		setOuterGap(value: Self.LazyPanel.GapSize): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

	}

	export namespace LazyPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (Self.LazyPanel.ContentProvider | PackageCore.Component | PackageCore.JSX.Element);

			decorator?: PackageCore.Decorator;

			horizontalAlignment?: Self.LazyPanel.HorizontalAlignment;

			outerGap?: (Self.LazyPanel.GapSize | Self.LazyPanel.GapSizeObject);

			verticalAlignment?: Self.LazyPanel.VerticalAlignment;

			element?: Self.LazyPanel.Element;

		}

		type ContentProvider = (setContent: (content: (PackageCore.Component | PackageCore.JSX.Element)) => void) => (PackageCore.Component | PackageCore.JSX.Element | globalThis.Promise<(PackageCore.Component | PackageCore.JSX.Element)>);

		interface GapSizeObject {
			top?: Self.LazyPanel.GapSize;

			bottom?: Self.LazyPanel.GapSize;

			start?: Self.LazyPanel.GapSize;

			end?: Self.LazyPanel.GapSize;

			horizontal?: Self.LazyPanel.GapSize;

			vertical?: Self.LazyPanel.GapSize;

		}

		enum HorizontalAlignment {
			START,
			END,
			CENTER,
			STRETCH,
		}

		enum VerticalAlignment {
			START,
			END,
			CENTER,
			STRETCH,
		}

		export import GapSize = Self.GapSize;

		export import Decorator = PackageCore.Decorator;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class Legend extends PackageCore.Component {
		constructor(options?: Self.Legend.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		color: (Self.Legend.Color | PackageCore.Color | string);

		shape: Self.Legend.Shape;

		size: Self.Legend.Size;

	}

	export namespace Legend {
		interface Options extends PackageCore.Component.Options {
			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			color?: (Self.Legend.Color | PackageCore.Color | string);

			shape?: Self.Legend.Shape;

			wrap?: Self.Legend.Size;

		}

		enum Color {
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			ERROR,
			LIGHT_BLUE,
		}

		enum Size {
			SMALL,
			MEDIUM,
			LARGE,
		}

		enum Shape {
			SQUARE,
			ROUNDED_SQUARE,
			CIRCLE,
		}

	}

	export class Link extends PackageCore.Component {
		constructor(options?: Self.Link.Options);

		content: (string | PackageCore.Translation | PackageCore.Component);

		children: PackageCore.VDom.Children;

		url: (string | PackageCore.Url | null);

		route: (string | PackageCore.Route | Self.Link.Route | null);

		target: (string | Self.Link.Target | null);

		wrap: (boolean | number);

		whitespace: boolean;

		setContent(content: (null | string | number | PackageCore.Translation | PackageCore.Component)): void;

		setUrl(url: string): void;

		setRoute(route: (string | PackageCore.Route | Self.Link.Route)): void;

		setTarget(target: (string | Self.Link.Target | null)): void;

		click(): void;

		static fromImage(linkOptions: Self.Link.Options, imageOptions: Self.Image.Options): void;

		static Event: Self.Link.EventTypes;

	}

	export namespace Link {
		interface Route {
			route: (string | PackageCore.Route);

			parameters?: object;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ACTION: string;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (string | number | PackageCore.Translation | PackageCore.Component | null);

			target?: Self.Link.Target;

			url?: (string | PackageCore.Url);

			route?: (string | PackageCore.Route | Self.Link.Route);

			whitespace?: boolean;

			wrap?: (boolean | number);

		}

		enum VisualStyle {
			DEFAULT,
			MENU,
		}

		enum Target {
			BLANK,
			SELF,
			PARENT,
			TOP,
		}

	}

	export class LinkCell extends Self.GridCell {
		constructor();

		link: (Self.Link | null);

		wrap: boolean;

		widgetOptions: (Self.Link.Options | Self.GridCell.WidgetOptionsCallback<Self.Link.Options>);

	}

	export namespace LinkCell {
	}

	export class LinkColumn extends Self.GridColumn {
		constructor(options: Self.LinkColumn);

		widgetOptions: (Self.Link.Options | Self.GridColumn.WidgetOptionsCallback<Self.Link.Options> | null);

		wrap: boolean;

	}

	export namespace LinkColumn {
		interface Options extends Self.GridColumn.Options {
			wrap?: boolean;

			widgetOptions?: (Self.Link.Options | Self.GridColumn.WidgetOptionsCallback<Self.Link.Options>);

		}

		export import Cell = Self.LinkCell;

	}

	export class LinkPortlet extends PackageCore.Component {
		constructor(options?: Self.LinkPortlet.Options);

	}

	export namespace LinkPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class List extends PackageCore.Component {
		constructor(options?: Self.List.Options);

		type: Self.List.Type;

		items: globalThis.Array<any>;

		children: PackageCore.VDom.Children;

		setType(type: Self.List.Type): void;

		setItems(items: globalThis.Array<any>): void;

		private _renderItems(): HTMLElement;

		static Ordered(props: Self.List.Options): PackageCore.JSX.Element;

		static Definition(props: Self.List.Options): PackageCore.JSX.Element;

		static Item(props: {children?: PackageCore.VDom.Children; classList?: (string | PackageCore.Style | globalThis.Array<(string | PackageCore.Style)>); rootStyle?: Record<string, string>; rootAttributes?: Record<string, string>; type?: Self.List.Type}): PackageCore.JSX.Element;

		static Term(props: {children?: PackageCore.VDom.Children; classList?: (string | PackageCore.Style | globalThis.Array<(string | PackageCore.Style)>); rootStyle?: Record<string, string>; rootAttributes?: Record<string, string>}): PackageCore.JSX.Element;

		static Details(props: {children?: PackageCore.VDom.Children; classList?: (string | PackageCore.Style | globalThis.Array<(string | PackageCore.Style)>); rootStyle?: Record<string, string>; rootAttributes?: Record<string, string>}): PackageCore.JSX.Element;

	}

	export namespace List {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: (globalThis.Array<any> | null);

			type?: Self.List.Type;

		}

		enum Type {
			UNORDERED,
			ORDERED,
			DEFINITION,
			NONE,
		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
		}

	}

	export class ListBox extends Self.DataSourceComponent {
		constructor(options?: Self.ListBox.Options);

		selectedItems: globalThis.Array<any>;

		selectedListItems: globalThis.Array<Self.ListItem>;

		selectedValues: globalThis.Array<any>;

		selectedIndexes: globalThis.Array<Self.ListBox.IndexPath>;

		selectable: boolean;

		selectableItems: globalThis.Array<Self.ListItem>;

		maxSelectedItemsCount: (number | null);

		draggable: boolean;

		showSelectionBar: boolean;

		showSelectedOnlyCheckbox: boolean;

		selectedOnly: boolean;

		multiSelect: boolean;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		valueMember: (Self.DataSourceComponent.ValueMember | null);

		showCheckMarks: boolean;

		allowKeySearch: boolean;

		cursorItem: Self.ListItem;

		cursorVisibility: Self.ListBox.CursorVisibility;

		initialCursorPosition: Self.ListBox.InitialCursorPosition;

		moveSelectionWithCursor: boolean;

		items: globalThis.Array<Self.ListItem>;

		visibleItems: globalThis.Array<Self.ListItem>;

		empty: boolean;

		placeholder: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		virtualization: boolean;

		maxViewportHeight: number;

		stickyGroupHeaders: boolean;

		dropPlaceholder: Self.ListItem;

		dropPlaceholderIndex: (number | null);

		rootItem: Self.ListItem;

		itemContent: (((item: Self.ListItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element)) | null);

		filterPredicate: ((() => boolean));

		onSelectionChanged: (Self.ListBox.SelectionChangedCallback | null);

		groupAutomationIdMember: (string | null);

		itemAtIndex(indexPath: Self.ListBox.IndexPath): (Self.ListItem | null);

		itemForElement(element: Element): (Self.ListItem | null);

		itemForDataItem(dataItem: any): (Self.ListItem | null);

		setCursorItem(item: (Self.ListItem | null), options?: object): void;

		setCursorVisibility(cursorVisibility: boolean): void;

		setItemContent(value: (((item: Self.ListItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element)) | null)): void;

		select(options: {items?: globalThis.Array<any>; listItems?: globalThis.Array<Self.ListItem>; indexes?: globalThis.Array<any>; values?: globalThis.Array<any>; append?: boolean; unselect?: boolean; reason?: string}): void;

		unselect(options: object): void;

		selectAll(options: object): void;

		selectAllVisible(options: object): void;

		unselectAll(options: object): void;

		filter(predicate: any): void;

		scrollTo(args: object): void;

		scrollToSelection(): void;

		setSelectable(value: boolean, options: object): void;

		setMaxSelectedItemsCount(value: number): void;

		setDraggable(value: boolean, args: object): void;

		setMultiSelect(value: object): void;

		setShowSelectionBar(value: boolean): void;

		getNextSelectableItem(from: Self.ListItem, step: number, circular: boolean): (Self.ListItem | null);

		setPlaceholder(value: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)): void;

		setDropPlaceholderIndex(index: number): void;

		visit(callback: (item: Self.ListItem) => (boolean | null)): void;

		private keySearch(message: object): boolean;

		static Event: Self.ListBox.EventTypes;

	}

	export namespace ListBox {
		type IndexPath = globalThis.Array<number>;

		interface Options extends Self.DataSourceComponent.Options {
			displayMember?: Self.DataSourceComponent.DisplayMember;

			valueMember?: Self.DataSourceComponent.ValueMember;

			groupAutomationIdMember?: string;

			itemDragSource?: PackageCore.DataExchange.DragSourceProvider;

			keepSelection?: boolean;

			moveSelectionWithCursor?: boolean;

			multiSelect?: boolean;

			placeholder?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			selectable?: boolean;

			draggable?: boolean;

			itemReorder?: boolean;

			selectedIndexes?: (number | globalThis.Array<number>);

			selectedItems?: any;

			selectedValues?: any;

			showCheckMarks?: boolean;

			withGroups?: boolean;

			stickyGroupHeaders?: boolean;

			itemContent?: (item: Self.ListItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element);

			cursorVisibility?: Self.ListBox.CursorVisibility;

			onSelectionChanged?: Self.ListBox.SelectionChangedCallback;

			customizeItem?: Self.ListBox.CustomizeItemCallback;

			allowKeySearch?: boolean;

			circularSelection?: boolean;

			comparator?: Self.ListBox.ComparatorCallback;

			maxSelectedItemsCount?: number;

			initialCursorPosition?: Self.ListBox.InitialCursorPosition;

			itemHeight?: number;

			itemVisualStyle?: Self.ListItem.VisualStyle;

			groupVisualStyle?: Self.ListItem.VisualStyle;

			virtualization?: boolean;

			itemMatcher?: Self.ListBox.ItemMatcherCallback;

			showSelectionBar?: boolean;

			showSelectedOnlyCheckbox?: boolean;

			selectedOnly?: boolean;

			maxViewportHeight?: number;

		}

		type SelectionChangedCallback = (args: Self.ListBox.SelectionChangedArgs, sender: Self.ListBox) => void;

		type CustomizeItemCallback = (args: Self.ListBox.CustomizeItemCallbackArgs) => void;

		interface CustomizeItemCallbackArgs {
			index: number;

			dataItem: any;

			listItem: Self.ListItem;

		}

		interface SelectionChangedArgs {
			items: globalThis.Array<any>;

			previousItems: globalThis.Array<any>;

			addedItems: globalThis.Array<any>;

			removedItems: globalThis.Array<any>;

			reason: Self.ListBox.Reason;

		}

		type ComparatorCallback = (left: any, right: any) => boolean;

		type ItemMatcherCallback = (item: Self.ListItem, text: string) => boolean;

		interface EventTypes extends Self.DataSourceComponent.EventTypes {
			SELECTION_CHANGED: string;

			CURSOR_MOVED: string;

			ITEM_UPDATE: string;

			ITEM_CLICKED: string;

			SCROLL_TO_END: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
			SYSTEM_SEARCH,
		}

		export import DataExchange = Self.ListDataExchange;

		export import Item = Self.ListItem;

		export import ItemVisualStyle = Self.ListItem.VisualStyle;

		enum Reason {
			CURSOR_SET,
			SELECT,
			INVALID_SELECTION,
			SET_MAX_SELECTED_ITEMS_COUNT,
			MULTI_SELECT_DISABLED,
			ITEMS_REMOVED,
			REMOVE_ITEM,
			MOVE_ITEM,
			DATA_RESET,
			NEW_DATA_ROW,
			DATA_BIND,
			DATA_LOADED,
			TOUCH,
			CLICK,
			DOUBLECLICK,
		}

		enum InitialCursorPosition {
			NONE,
			FIRST,
			FIRST_SELECTED,
		}

		enum CursorVisibility {
			FOCUS,
			ALWAYS,
		}

	}

	export class ListBoxPicker extends Self.Picker {
		constructor(options: Self.Picker.Options);

		dataSource: object;

		filter: (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		listBox: Self.ListBox;

		debounce: number;

		private _handleSelectionChanged(args: {addedItems: globalThis.Array<any>; removedItems: globalThis.Array<any>}, reason: string): void;

		private _handleListItemClicked(args: {buttons: object}): void;

		private _forwardMessageToList(message: PackageCore.RoutedMessage, result: object): void;

		private _createFilter(options: object): (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		static createItemFilter(): (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		static formattedContentCreator(): (text: string) => (item: Self.ListItem) => PackageCore.JSX.Element;

	}

	export namespace ListBoxPicker {
		interface Options extends Self.Picker.Options {
			listBox?: Self.ListBox.Options;

			dataSource?: PackageCore.DataSource;

			filter?: Self.ListBoxPicker.FilterCallback;

			filterType?: Self.ListBoxPicker.FilterType;

			highlightItems?: boolean;

			caseSensitive?: boolean;

			debounce?: number;

		}

		type FilterCallback = (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		export import Reason = Self.Picker.Reason;

		enum FilterType {
			STARTS_WITH,
			CONTAINS,
		}

	}

	class ListComparatorSelection {
		constructor();

	}

	namespace ListComparatorSelection {
	}

	export namespace ListDataExchange {
		function dragSource(options: object): PackageCore.DataExchange.DragSourceProvider;

		function dragTarget(options: object): PackageCore.DataExchange.DragTargetProvider;

	}

	class ListEqualitySelection {
		constructor();

	}

	namespace ListEqualitySelection {
	}

	export class ListItem extends PackageCore.Component {
		constructor();

		listBox: Self.ListBox;

		parentItem: Self.ListItem;

		childItems: globalThis.Array<Self.ListItem>;

		empty: boolean;

		index: number;

		indexPath: Self.ListBox.IndexPath;

		visibleIndex: number;

		level: number;

		dataEntry: object;

		dataItem: any;

		dataBound: boolean;

		height: (number | null);

		userData: any;

		renderData: (object | null);

		value: any;

		label: string;

		selectable: boolean;

		effectiveSelectable: boolean;

		cursor: boolean;

		contentProvider: (((item: Self.ListItem, renderData: object) => PackageCore.JSX.Element) | null);

		draggable: boolean;

		effectiveDraggable: boolean;

		selected: boolean;

		effectiveVisible: boolean;

		content: (PackageCore.Component | null);

		divider: boolean;

		addItems(items: globalThis.Array<Self.ListItem>, options: {index: number; reason?: string}): void;

		removeItems(index: number, count: number, options: {reason?: string}): void;

		bind(dataEntry: PackageCore.DataStoreEntry, delegate: (Self.ListBox.CustomizeItemCallback | null)): void;

		unbind(): void;

		refresh(): void;

		setSelectable(value: boolean, options: object): void;

		setSelected(value: boolean, options: object): void;

		setCursor(value: boolean): void;

		setDivider(divider: boolean): void;

		setDraggable(value: boolean, options: object): void;

		setHeight(value: (number | null), options: object): void;

		visit(callback: (item: Self.ListItem) => (boolean | null), self: Self.ListItem): void;

		setupVirtualPosition(): void;

		static defaultContent(item: Self.ListItem): PackageCore.JSX.Element;

		static highlightedContent(item: Self.ListItem, options: object): PackageCore.JSX.Element;

		static Event: Self.ListItem.EventTypes;

	}

	export namespace ListItem {
		interface Options extends PackageCore.Component.Options {
			listBox: Self.ListBox;

			index: number;

			level: number;

			height: (number | null);

			dataEntry: PackageCore.DataStoreEntry;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_CHANGED: string;

			SELECTABLE_CHANGED: string;

			EFFECTIVE_SELECTABLE_CHANGED: string;

			DRAGGABLE_CHANGED: string;

			EFFECTIVE_DRAGGABLE_CHANGED: string;

			VISIBLE_CHANGED: string;

			EFFECTIVE_VISIBLE_CHANGED: string;

			HEIGHT_CHANGED: string;

			ITEMS_ADDED: string;

			ITEMS_REMOVED: string;

		}

		enum VisualStyle {
			ITEM,
			GROUP,
			PLAIN,
			BLANK,
		}

	}

	class ListMouseSelectionHandler implements PackageCore.MessageHandler {
		constructor(options: object);

		attach(): void;

		detach(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	namespace ListMouseSelectionHandler {
	}

	export enum ListSelectReason {
		KEY_ARROW_UP,
		KEY_ARROW_DOWN,
		KEY_ENTER,
		KEY_SPACE,
		KEY_HOME,
		KEY_END,
		KEY_ALL,
		FOCUS_IN,
	}

	class ListSelectionBar extends PackageCore.Component {
		constructor(options: Self.ListSelectionBar.Options);

		selectedItemsCount: number;

		selectableItemsCount: number;

		maxSelectableItemsCount: number;

		selectedOnly: boolean;

		showSelectedOnlyCheckbox: boolean;

		onSelectAll: (value: boolean) => void;

		onSelectedOnlyChanged: (value: boolean) => void;

	}

	namespace ListSelectionBar {
		interface Options extends PackageCore.Component.Options {
			selectedItemsCount: number;

			selectableItemsCount: number;

			maxSelectableItemsCount: number;

			selectedOnly: boolean;

			showSelectedOnlyCheckbox: boolean;

			onSelectAll: (value: boolean) => void;

			onSelectedOnlyChanged: (value: boolean) => void;

		}

	}

	export class ListView extends PackageCore.Component {
		dataProvider: (Self.ListView.StaticDataProvider | Self.ListView.PagedDataProvider);

		dataSource: (PackageCore.DataSource | null);

		filteredDataSource: (PackageCore.DataSource | null);

		columns: (Self.DataGrid.ColumnConfiguration | null);

		filters: (globalThis.Array<PackageCore.JSX.Element> | globalThis.Array<Self.FilterFactory.Filter> | null);

		filterValues: Record<string, any>;

		filtersPosition: Self.ListView.FiltersPosition;

		availableFiltersPositions: globalThis.Array<Self.ListView.FiltersPosition>;

		editable: boolean;

		pagination: (Self.Pagination.Options | boolean | null);

		/**
		 * @deprecated
		 */
		paginationSegments: globalThis.Array<{label: string}>;

		totalItemsCount: (number | null);

		selectedPageIndex: (number | null);

		searchPhrase: string;

		refreshButtonVisible: boolean;

		searchBoxVisible: boolean;

		filterHandler: (Self.ListView.FilterHandlerCallback | null);

		dataGridOptions: Self.DataGrid.Options;

		emptyStateMessage: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		errorMessage: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | null);

		activeLayout: Self.ListView.Layout;

		availableLayouts: globalThis.Array<Self.ListView.Layout>;

		detailRowContent: (Self.GridSyntheticCell.ContentCallback | null);

		detailRowHeight: (number | Self.GridRow.Height);

		masterDetailContent: (Self.ListView.MasterDetailContentCallback | null);

		masterDetailWidth: Self.ListView.MasterDetailWidth;

		masterDetailNoSelectionMessage: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		cursorItem: any;

		itemReorder: boolean;

		itemActionsProvider: (Self.ListView.ItemActionsProvider | null);

		selectedItems: globalThis.Array<any>;

		itemSelection: Self.ListView.ItemSelection;

		viewSelectedItems: boolean;

		ignoreFilters: boolean;

		selectionActions: globalThis.Array<Self.ListView.SelectionAction>;

		listActions: globalThis.Array<Self.ListView.Action>;

		quickSort: (Self.ListView.QuickSortOption | null);

		quickSortOptions: globalThis.Array<Self.ListView.QuickSortOption>;

		sortable: boolean;

		multiColumnSort: boolean;

		sortDirections: globalThis.Array<Self.ListView.SortDirectionConfig>;

		responsiveStrategy: (Self.ListView.ResponsiveStrategy | Self.ListView.ResponsiveStrategyCallback);

		onStateUpdated: (Self.ListView.StateUpdatedCallback | null);

		/**
		 * @deprecated Use dataLoaderVisible
		 */
		loaderVisible: boolean;

		dataLoaderVisible: boolean;

		state: Self.ListView.State;

		dataGrid: (Self.DataGrid | null);

		/**
		 * @deprecated
		 */
		layout: any;

		refresh(args?: {includeFilters?: boolean}): void;

		/**
		 * @deprecated
		 */
		showPage(dataSource: PackageCore.DataSource, pageSize?: number, pageIndex?: number): void;

		/**
		 * @deprecated
		 */
		showData(dataSource: PackageCore.DataSource): void;

		showError(message: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)): void;

		hideError(): void;

		flushUpdates(): void;

		/**
		 * @deprecated
		 */
		static ofStaticData(options: Self.ListView.LegacyStaticFactoryOptions): Self.ListView;

		/**
		 * @deprecated
		 */
		static ofPagedData(options: Self.ListView.LegacyPagedFactoryOptions): Self.ListView;

		static Event: Self.ListView.EventTypes;

	}

	export namespace ListView {
		interface Options extends PackageCore.Component.Options {
			columns?: Self.DataGrid.ColumnConfiguration;

			dataProvider?: Self.ListView.DataProvider;

			pagedDataProvider?: boolean;

			filters?: (globalThis.Array<PackageCore.JSX.Element> | globalThis.Array<Self.FilterFactory.Filter>);

			filterValues?: Self.ListView.FilterValues;

			filtersPosition?: Self.ListView.FiltersPosition;

			availableFiltersPositions?: globalThis.Array<Self.ListView.FiltersPosition>;

			editable?: boolean;

			pagination?: (Self.Pagination.Options | boolean | null);

			searchPhrase?: string;

			totalItemsCount?: number;

			selectedPageIndex?: number;

			refreshButtonVisible?: boolean;

			searchBoxVisible?: boolean;

			filterHandler?: Self.ListView.FilterHandlerCallback;

			emptyStateMessage?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			errorMessage?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			detailRowContent?: (Self.GridSyntheticCell.ContentCallback | PackageCore.JSX.Element | PackageCore.Component);

			detailRowHeight?: (number | Self.GridRow.Height);

			activeLayout?: Self.ListView.Layout;

			availableLayouts?: globalThis.Array<Self.ListView.Layout>;

			masterDetailContent?: Self.ListView.MasterDetailContentCallback;

			masterDetailWidth?: Self.ListView.MasterDetailWidth;

			masterDetailNoSelectionMessage?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			cursorItem?: any;

			itemReorder?: boolean;

			itemActionsProvider?: Self.ListView.ItemActionsProvider;

			selectedItems?: globalThis.Array<any>;

			itemSelection?: Self.ListView.ItemSelection;

			viewSelectedItems?: boolean;

			ignoreFilters?: boolean;

			selectionActions?: globalThis.Array<Self.ListView.SelectionAction>;

			listActions?: globalThis.Array<Self.ListView.Action>;

			quickSort?: Self.ListView.QuickSortOption;

			quickSortOptions?: globalThis.Array<Self.ListView.QuickSortOption>;

			sortable?: boolean;

			multiColumnSort?: boolean;

			sortDirections?: globalThis.Array<Self.ListView.SortDirectionConfig>;

			dataGridOptions?: Self.DataGrid.Options;

			dataLoaderVisible?: boolean;

			responsiveStrategy?: (Self.ListView.ResponsiveStrategy | Self.ListView.ResponsiveStrategyCallback);

			onStateUpdated?: Self.ListView.StateUpdatedCallback;

		}

		interface State {
			quickSort: (Self.ListView.QuickSortOption | null);

			filtersIgnored: boolean;

			filters: globalThis.Array<Self.ListView.FilterState>;

			activeFilters: globalThis.Array<Self.ListView.FilterState>;

			filterValues: Self.ListView.FilterValues;

			searchPhrase: string;

			viewSelectedItems: globalThis.Array<any>;

			sorting: globalThis.Array<Self.ListView.SortDirectionState>;

			pagination: Self.ListView.PaginationState;

		}

		type FilterId = (string | number);

		interface FilterState {
			id: Self.ListView.FilterId;

			value: any;

			filterPredicate: Self.ListView.FilterPredicate;

		}

		type FilterPredicate = (item: any, value: any) => boolean;

		type ComposedFilterPredicate = (item: any) => boolean;

		interface PaginationState {
			rowsPerPage: number;

			currentPage: object;

			currentIndex: number;

		}

		type DataProvider = (Self.ListView.StaticDataProvider | Self.ListView.PagedDataProvider);

		type StaticDataProvider = () => PackageCore.DataSource;

		type PagedDataProvider = (state: Self.ListView.State) => globalThis.Promise<Self.ListView.PagedDataProviderResult>;

		interface PagedDataProviderResult {
			dataSource: PackageCore.DataSource;

			totalItemsCount?: number;

		}

		type StateUpdatedCallback = (args: Self.ListView.StateUpdatedCallbackArgs) => void;

		interface StateUpdatedCallbackArgs {
			state: Self.ListView.State;

			previousState: Self.ListView.State;

		}

		type FilterHandlerCallback = (args: Self.ListView.FilterHandlerCallbackArgs) => PackageCore.DataSource;

		interface FilterHandlerCallbackArgs {
			dataSource: PackageCore.DataSource;

			predicate: Self.ListView.ComposedFilterPredicate;

			searchPhrasePredicate: Self.ListView.ComposedFilterPredicate;

			filtersPredicate: Self.ListView.ComposedFilterPredicate;

			state: any;

		}

		type FilterValues = Record<Self.ListView.FilterId, any>;

		type MasterDetailContentCallback = (dataItem: any) => (null | PackageCore.Component | PackageCore.JSX.Element);

		type ItemActionsProvider = (dataItem: any) => globalThis.Array<Self.ListView.Action>;

		type Action = (Self.ListView.ButtonAction | Self.ListView.LinkAction);

		interface ButtonAction {
			icon?: Self.Image.Source;

			iconOnly?: boolean;

			label?: (string | PackageCore.Translation);

			action?: Self.Button.ActionCallback;

			type?: Self.Button.Type;

			items?: globalThis.Array<Self.MenuItem.ItemDefinition>;

			enabled?: boolean;

		}

		interface LinkAction {
			url?: (string | PackageCore.Url);

			route?: (string | PackageCore.Route | Self.Link.Route);

			label: (string | PackageCore.Translation);

			enabled?: boolean;

		}

		interface SelectionAction {
			action?: Self.ListView.SelectionActionCallback;

			icon?: Self.Image.Source;

			iconPosition?: Self.Button.IconPosition;

			label?: (null | string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			type?: Self.Button.Type;

		}

		type SelectionActionCallback = (selectedItems: globalThis.Array<any>) => void;

		interface QuickSortOption {
			id: any;

			icon?: Self.Image.Source;

			label: (string | PackageCore.Translation);

		}

		interface SortDirectionConfig {
			columnName: string;

			direction: Self.ListView.SortDirection;

		}

		interface SortDirectionState extends Self.ListView.SortDirectionConfig {
			column?: Self.DataGrid.ColumnDefinition;

		}

		type ResponsiveStrategyCallback = (args: Self.ListView.ResponsiveStrategyCallbackArgs) => Self.ListView.ResponsiveStrategyCallbackResult;

		interface ResponsiveStrategyCallbackArgs {
			width: number;

			searchBoxVisible: boolean;

			filtersPostion: Self.ListView.FiltersPosition;

			filterCount: number;

			listActionCount: number;

		}

		interface ResponsiveStrategyCallbackResult {
			collapseSearchBox?: boolean;

			collapseFilters?: boolean;

			maxVisibleListActions?: number;

			listActionsBelowFilters?: boolean;

		}

		interface MasterDetailWidthOption {
			master: Self.SplitPanelItem.SizeOptions;

			detail: Self.SplitPanelItem.SizeOptions;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			STATE_UPDATED: string;

			SELECTION_CHANGED: string;

			REFRESH_REQUESTED: string;

			ITEM_REORDERED: string;

			ITEM_EDITED: string;

		}

		export import ColumnFactory = Self.ListViewColumnFactory;

		export import FiltersPosition = Self.ListViewConstant.FiltersPosition;

		export import Filter = Self.ListViewFilter;

		export import TextBoxFilterMatchingOperator = Self.ListViewConstant.TextBoxFilterMatchingOperator;

		namespace Pagination {
			function basic(rowsCount?: number, rowsPerPage?: number): Self.Pagination.Options;

			function customizablePageSize(rowsCount?: number, rowsPerPage?: number): Self.Pagination.Options;

			function segmented(segments: globalThis.Array<object>): Self.Pagination.Options;

		}

		export import Layout = Self.ListViewConstant.Layout;

		export import MasterDetailWidth = Self.ListViewConstant.MasterDetailWidth;

		/**
		 * @deprecated Use ListView.MasterDetailWidth instead
		 */
		export import TableMasterDetailWidth = Self.ListViewConstant.MasterDetailWidth;

		export import SortDirection = Self.GridConstants.SortDirection;

		export import ItemSelection = Self.ListViewConstant.ItemSelection;

		export import Visibility = Self.ListViewConstant.Visibility;

		export import VisibilityBreakpoint = Self.GridColumn.VisibilityBreakpoint;

		export import ResponsiveStrategy = Self.ListViewConstant.ResponsiveStrategy;

		interface LegacyOptions extends PackageCore.Component.Options {
			defaultLayout?: Self.ListView.Layout;

			availableLayouts?: Record<Self.ListView.Layout, boolean>;

			refreshButtonVisible?: boolean;

			searchBoxVisible?: boolean;

			listActions?: globalThis.Array<any>;

			itemActionsProvider?: (dataItem: any) => globalThis.Array<any>;

			selectionActions?: globalThis.Array<any>;

			itemSelection?: Self.ListView.ItemSelection;

			filtersPosition?: Self.ListView.FiltersPosition;

			availableFiltersPositions?: globalThis.Array<Self.ListView.FiltersPosition>;

			filters?: globalThis.Array<Self.FilterFactory.Filter>;

			quickSortOptions?: globalThis.Array<any>;

			responsiveStrategy?: Self.ListView.ResponsiveStrategy;

			layout?: object;

			totalItemsCount?: number;

			emptyStateMessage?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			itemReorder?: boolean;

			pagination?: Self.Pagination.Options;

		}

		interface LegacyStaticFactoryOptions extends Self.ListView.LegacyOptions {
			parentContext?: PackageCore.Context;

			dataProvider: Self.ListView.StaticDataProvider;

			filterHandler?: Self.ListView.FilterHandlerCallback;

		}

		interface LegacyPagedFactoryOptions extends Self.ListView.LegacyOptions {
			parentContext?: PackageCore.Context;

			dataProvider: Self.ListView.PagedDataProvider;

		}

		interface BaseFilterProps {
			id: Self.ListView.FilterId;

			label: string;

			binding?: string;

			filterPredicate?: Self.ListView.FilterPredicate;

		}

		type CreateColumnOptions = (Omit<Self.ActionColumn.Options, "type"> | Omit<Self.CheckBoxColumn.Options, "type"> | Omit<Self.DatePickerColumn.Options, "type"> | Omit<Self.DropdownColumn.Options, "type"> | Omit<Self.GrabColumn.Options, "type"> | Omit<Self.LinkColumn.Options, "type"> | Omit<Self.MultiselectDropdownColumn.Options, "type"> | Omit<Self.SelectionColumn.Options, "type"> | Omit<Self.TemplatedColumn.Options, "type"> | Omit<Self.TextAreaColumn.Options, "type"> | Omit<Self.TextBoxColumn.Options, "type"> | Omit<Self.TimePickerColumn.Options, "type"> | Omit<Self.TreeColumn.Options, "type">);

	}

	export namespace ListViewColumnFactory {
		function createTextColumn(columnOptions: Omit<Self.TextBoxColumn.Options, "type">, widgetOptions?: Self.TextBox.Options): Self.TextBoxColumn.Options;

		function createNumberColumn(columnOptions: Omit<Self.TextBoxColumn.Options, "type">, widgetOptions?: Self.TextBox.Options): Self.TextBoxColumn.Options;

		function createTimeColumn(columnOptions: Omit<Self.TimePickerColumn.Options, "type">, widgetOptions?: Self.TimePicker.Options): Self.TimePickerColumn.Options;

		function createDateColumn(columnOptions: Omit<Self.DatePickerColumn.Options, "type">, widgetOptions?: Self.DatePicker.Options): Self.DatePickerColumn.Options;

		function createDateTimeColumn(columnOptions: Omit<Self.DatePickerColumn.Options, "type">, widgetOptions?: Self.DatePicker.Options): Self.DatePickerColumn.Options;

		function createCheckColumn(columnOptions: Omit<Self.CheckBoxColumn.Options, "type">, widgetOptions?: Self.CheckBox.Options): Self.CheckBoxColumn.Options;

		function createLinkColumn(columnOptions: Omit<Self.LinkColumn.Options, "type">, widgetOptions?: Self.Link.Options): Self.LinkColumn.Options;

		/**
		 * @deprecated
		 */
		function createImageColumn(columnOptions: Omit<Self.TemplatedColumn.Options, "type">, widgetOptions?: Self.Image.Options): Self.TemplatedColumn.Options;

		function createTextAreaColumn(columnOptions: Omit<Self.TextAreaColumn.Options, "type">, widgetOptions?: Self.TextArea.Options): Self.TextAreaColumn.Options;

		/**
		 * @deprecated
		 */
		function createEditViewColumn(columnOptions: Omit<Self.TemplatedColumn.Options, "type">, widgetOptions?: object): Self.TemplatedColumn.Options;

		function create(columnType: Self.ListViewColumnFactory.ColumnType, columnOptions: Self.ListView.CreateColumnOptions, widgetOptions?: object): Self.DataGrid.ColumnDefinition;

		enum ColumnType {
			CHECK,
			DATE,
			TIME,
			DATE_TIME,
			LINK,
			NUMBER,
			TEXT_BOX,
			TEXT_AREA,
			EDIT_VIEW,
			IMAGE,
			ACTION,
			TEMPLATED,
		}

	}

	namespace ListViewConstant {
		enum ItemSelection {
			NONE,
			SINGLE,
			MULTIPLE,
		}

		enum Layout {
			TABLE,
			TABLE_DETAIL,
		}

		enum FiltersPosition {
			TOP,
			SIDE,
			NONE,
		}

		enum Visibility {
			ABOVE,
			BELOW,
			FOR,
		}

		enum ResponsiveStrategy {
			ONE_LINE,
			TWO_LINES,
		}

		enum TextBoxFilterMatchingOperator {
			STARTS_WITH,
			ENDS_WITH,
			CONTAINS,
		}

		enum MasterDetailWidth {
			EQUAL,
			SMALL_DETAIL,
			LARGE_DETAIL,
			CONTENT,
		}

	}

	export namespace ListViewFilter {
		function Custom(props: {id: Self.ListView.FilterId; filterPredicate: Self.ListView.FilterPredicate; children?: PackageCore.JSX.Element}): PackageCore.JSX.Element;

		function CheckBox(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

		function TextBox(props: Self.ListView.BaseFilterProps & {matchingOperator?: Self.ListView.TextBoxFilterMatchingOperator}): PackageCore.JSX.Element;

		function Toggle(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

		function Dropdown(props: Self.ListView.BaseFilterProps & {dataSource: PackageCore.DataSource; displayMember?: Self.DataSourceComponent.DisplayMember; valueMember?: Self.DataSourceComponent.ValueMember; search?: boolean}): PackageCore.JSX.Element;

		function MultiselectDropdown(props: Self.ListView.BaseFilterProps & {dataSource: PackageCore.DataSource; displayMember?: Self.DataSourceComponent.DisplayMember; valueMember?: Self.DataSourceComponent.ValueMember}): PackageCore.JSX.Element;

		function Date(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

		function DateRange(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

		function Time(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

		function TimeRange(props: Self.ListView.BaseFilterProps): PackageCore.JSX.Element;

	}

	export class Loader extends PackageCore.Component {
		constructor(options?: Self.Loader.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component);

		startLabel: (string | number | PackageCore.Translation | PackageCore.Component);

		endLabel: (string | number | PackageCore.Translation | PackageCore.Component);

		icon: (Self.Image.Source | Self.Loader.Icon | null);

		verticalAlignment: Self.Loader.VerticalAlignment;

		horizontalAlignment: Self.Loader.HorizontalAlignment;

		labelAlignment: Self.Loader.LabelAlignment;

		size: Self.Loader.Size;

		showCurtain: boolean;

		indeterminate: boolean;

		value: number;

		max: number;

		embedded: boolean;

		parentBorderSize: number;

		coverParent: boolean;

		setIcon(icon: Self.Image.Source): void;

		setLabel(label: (string | PackageCore.Translation | PackageCore.Component)): void;

		setStartLabel(label: (string | PackageCore.Translation | PackageCore.Component)): void;

		setEndLabel(label: (string | PackageCore.Translation | PackageCore.Component)): void;

		setVerticalAlignment(alignment: Self.Loader.VerticalAlignment): void;

		setHorizontalAlignment(alignment: Self.Loader.HorizontalAlignment): void;

		setLabelAlignment(labelAlignment: Self.Loader.LabelAlignment): void;

		setValue(value: number): void;

		setMax(max: number): void;

		setEmbedded(value: boolean): void;

		setSize(size: Self.Loader.Size): void;

		setShowCurtain(showCurtain: boolean): void;

		private _getProgress(): number;

	}

	export namespace Loader {
		interface Options extends PackageCore.Component.Options {
			embedded?: boolean;

			label?: (string | number | PackageCore.Translation | PackageCore.Component);

			startLabel?: (string | number | PackageCore.Translation | PackageCore.Component);

			endLabel?: (string | number | PackageCore.Translation | PackageCore.Component);

			horizontalAlignment?: Self.Loader.HorizontalAlignment;

			icon?: (Self.Image.Source | Self.Loader.Icon);

			labelAlignment?: Self.Loader.LabelAlignment;

			max?: number;

			showCurtain?: boolean;

			size?: Self.Loader.Size;

			target?: (HTMLElement | PackageCore.Component);

			value?: number;

			verticalAlignment?: Self.Loader.VerticalAlignment;

			coverParent?: boolean;

			parentBorderSize?: number;

			parentHasStaticPosition?: boolean;

		}

		enum VisualStyle {
			DARK,
			LIGHT,
		}

		enum Icon {
			CIRCULAR,
			HORIZONTAL,
		}

		enum VerticalAlignment {
			TOP,
			MIDDLE,
			BOTTOM,
		}

		enum HorizontalAlignment {
			START,
			END,
			CENTER,
			STRETCH,
		}

		enum LabelAlignment {
			START,
			END,
			TOP,
			BOTTOM,
		}

		enum Size {
			SMALL,
			MEDIUM,
			LARGE,
			EXTRA_LARGE,
			EXTRA_EXTRA_LARGE,
		}

		enum DataAttribute {
			SIZE,
			HORIZONTAL_ALIGNMENT_,
			VERTICAL_ALIGNMENT,
			LABEL_ALIGNMENT,
			ICON,
			COVER_PARENT,
			EMBEDDED,
			CURTAIN,
			LABEL_TYPE,
			TARGET,
			ICON_OUTLINE,
			ICON_RUNNER,
		}

	}

	export class MaskedCharacter {
		constructor(character: (string | null), rule: (Self.MaskedCharacter.Rule | null));

		characterOrPlaceholder: string;

		characterOrFill: (string | null);

		equals(maskedCharacter: Self.MaskedCharacter): boolean;

		isEmpty(): boolean;

		isTerminal(): boolean;

		matches(character: string): boolean;

		clear(): Self.MaskedCharacter;

		fill(character: string): Self.MaskedCharacter;

		static terminal(character: string): Self.MaskedCharacter;

		static filled(character: string, rule: Self.MaskedCharacter.Rule): Self.MaskedCharacter;

		static empty(rule: Self.MaskedCharacter.Rule): Self.MaskedCharacter;

	}

	export namespace MaskedCharacter {
		interface Rule {
			match: (character: string) => boolean;

			fill?: string;

			placeholder?: string;

		}

	}

	export class MaskedText {
		constructor(value: globalThis.Array<Self.MaskedCharacter>);

		length: number;

		empty: boolean;

		text: string;

		rawText: globalThis.Array<string>;

		maskedText: string;

		equals(maskedText: Self.MaskedText): boolean;

		at(index: number): Self.MaskedCharacter;

		setRawText(text: globalThis.Array<string>): Self.MaskedText;

		insertText(text: string, start: number, end: number): Self.MaskedText;

		clearText(start: number, end: number): Self.MaskedText;

		static create(mask: string, rules: Record<string, Self.MaskedCharacter.Rule>): Self.MaskedText;

	}

	export namespace MaskedText {
	}

	export class MaskedTextBox extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.MaskedTextBox.Options);

		data: Self.MaskedText;

		text: string;

		rawText: globalThis.Array<string>;

		inputText: string;

		acceptedData: Self.MaskedText;

		acceptedText: string;

		acceptedRawText: string;

		empty: boolean;

		mandatory: boolean;

		selection: Self.MaskedTextBox.Selection;

		caretPosition: number;

		textAlignment: Self.MaskedTextBox.TextAlignment;

		clearButton: boolean;

		inputSize: number;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		size: Self.MaskedTextBox.Size;

		onTextChanged: (Self.MaskedTextBox.TextChangedCallback | null);

		onTextAccepted: (Self.MaskedTextBox.TextAcceptedCallback | null);

		setText(text: string, options?: {reason?: string; accept?: boolean}): void;

		setRawText(rawText: globalThis.Array<string>, options?: {reason?: string; accept?: boolean}): void;

		setSelection(options: {start: number; end: number; direction?: Self.MaskedTextBox.SelectionDirection; reason?: string}): boolean;

		setCaretPosition(position: number): void;

		setInputSize(size: number): void;

		setTextAlignment(alignment: Self.MaskedTextBox.TextAlignment): void;

		setClearButton(value: boolean): void;

		selectAll(): boolean;

		acceptChanges(options: {reason?: string}): void;

		static Event: Self.MaskedTextBox.EventTypes;

	}

	export namespace MaskedTextBox {
		interface Options extends PackageCore.Component.Options {
			acceptInvalidValue?: boolean;

			clearButton?: boolean;

			inputSize?: (number | null);

			mask?: string;

			rules: Record<string, Self.MaskedCharacter.Rule>;

			text: (string | number);

			textAlignment?: Self.MaskedTextBox.TextAlignment;

			mandatory?: boolean;

			size?: Self.MaskedTextBox.Size;

			textValidator?: Self.MaskedTextBox.TextValidatorCallback;

			onTextChanged?: Self.MaskedTextBox.TextChangedCallback;

			onTextAccepted?: Self.MaskedTextBox.TextAcceptedCallback;

		}

		type TextChangedCallback = (args: Self.MaskedTextBox.TextChangedArgs, sender: Self.MaskedTextBox) => void;

		interface TextChangedArgs {
			text: string;

			previousText: string;

			rawText: string;

			previousRawText: string;

			reason: Self.MaskedTextBox.TextChangeReason;

		}

		type TextAcceptedCallback = (args: Self.MaskedTextBox.TextAcceptedArgs, sender: Self.MaskedTextBox) => void;

		interface TextAcceptedArgs {
			text: string;

			previousText: string;

			rawText: string;

			previousRawText: string;

			reason: Self.MaskedTextBox.TextAcceptedReason;

		}

		type TextValidatorCallback = (args: Self.MaskedTextBox.TextValidatorCallbackArgs) => boolean;

		interface TextValidatorCallbackArgs {
			text: string;

			rawText: globalThis.Array<string>;

		}

		interface Selection {
			start: number;

			end: number;

			direction?: Self.MaskedTextBox.SelectionDirection;

			text?: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TEXT_CHANGED: string;

			TEXT_ACCEPTED: string;

			SELECTION_CHANGED: string;

			CARET_POSITION_CHANGED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
			REDWOOD_FIELD,
		}

		enum TextAlignment {
			LEFT,
			RIGHT,
			CENTER,
		}

		enum TextChangeReason {
			INPUT,
			MAX_LENGTH,
		}

		enum TextAcceptedReason {
			FOCUS_OUT,
			ENTER,
			CALL,
		}

		enum SelectionChangeReason {
			SELECT_ALL,
			TEXT_CHANGED,
			REFRESH,
		}

		enum Reason {
			INSERT,
			CLEAR,
		}

		export import MaskedCharacter = Self.MaskedCharacter;

		export import MaskedText = Self.MaskedText;

		export import Size = Self.InputSize;

		export import SelectionDirection = Self.TextSelection.Direction;

	}

	class Matcher {
		addElements(elements: globalThis.Map<any, any>): void;

		removeElement(elementId: any): void;

	}

	namespace Matcher {
	}

	export class Menu extends PackageCore.Component {
		constructor(options?: Self.Menu.Options);

		role: Self.Menu.Role;

		items: globalThis.Array<Self.MenuItem>;

		children: PackageCore.VDom.Children;

		collapseOnAction: boolean;

		orientation: Self.Menu.Orientation;

		size: Self.Menu.Size;

		type: Self.Menu.Type;

		setOrientation(orientation: Self.Menu.Orientation): void;

		setSize(size: Self.Menu.Size): void;

		select(value: string): boolean;

		highlight(value: string): boolean;

		private handleAction(args: object): void;

		private selectItem(item: Self.MenuItem, reason?: string): boolean;

		private selectNextItem(item?: Self.MenuItem, reason?: string): boolean;

		private selectPreviousItem(item?: Self.MenuItem, reason?: string): boolean;

		private selectFirstItem(reason?: string): boolean;

		private selectLastItem(reason?: string): boolean;

		private hasSubmenu(item: Self.MenuItem): boolean;

		private isSubmenuOpened(item?: Self.MenuItem): (boolean | null);

		private getOpenedSubmenu(item?: Self.MenuItem): (Self.Menu | null);

		private openSubmenu(item: PackageCore.Component, reason?: string): (Self.Menu | null);

		private closeSubmenu(reason?: string): boolean;

		private toggleSubmenu(item: PackageCore.Component, reason?: string): boolean;

		private findItemByComponent(component: PackageCore.Component, transitive?: boolean): (PackageCore.Component | null);

		static vertical(items: globalThis.Array<Self.MenuItem>): void;

		static horizontal(items: globalThis.Array<Self.MenuItem>): void;

		private static _createMenuWindow(menu: Self.Menu, windowOptions?: Self.Window.Options): Self.Window;

		static Event: Self.Menu.EventTypes;

		static Item(props?: Self.MenuItem.ItemDefinition): PackageCore.JSX.Element;

		static Group(options?: Self.MenuGroup.Options): PackageCore.JSX.Element;

	}

	export namespace Menu {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<Self.MenuItem.ItemDefinition>;

			circularSelection?: boolean;

			collapseOnAction?: boolean;

			orientation?: Self.Menu.Orientation;

			scrollControl?: Self.Menu.ScrollControl;

			role?: Self.Menu.Role;

			size?: Self.Menu.Size;

			stackIcon?: boolean;

			type?: Self.Menu.Type;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ACTION: string;

			ITEM_SELECTED: string;

			SUBMENU_OPENED: string;

			SUBMENU_CLOSED: string;

		}

		export import Orientation = Self.MenuOptions.Orientation;

		export import Role = Self.MenuOptions.Role;

		export import Reason = Self.MenuOptions.Reason;

		export import Size = Self.MenuOptions.Size;

		export import Type = Self.MenuOptions.Type;

		export import VisualStyle = Self.MenuOptions.VisualStyle;

		enum ItemType {
			MENU_ITEM,
			ITEM,
			GROUP,
		}

		export import ScrollControl = Self.ScrollPanel.ScrollControl;

	}

	export class MenuBar extends PackageCore.Component {
		constructor(options?: Self.MenuBar.Options);

	}

	export namespace MenuBar {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items: globalThis.Array<Self.MenuItem>;

			menu: Self.Menu.Options;

			justification?: Self.MenuBar.Justification;

		}

		enum Justification {
			START,
			END,
		}

	}

	export class MenuButton extends Self.Button {
		constructor(options?: Self.MenuButton.Options);

		menuOpened: boolean;

		menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu.Options);

		openOnHover: boolean;

		menuTarget: Self.Window.Target;

		setMenu(menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu)): void;

		openMenu(args?: object): void;

		closeMenu(args?: {reason: string}): void;

		toggleMenu(args?: object): void;

		static dropDown(options: Self.MenuButton.Options): Self.MenuButton;

		static DropDown(props: Self.MenuButton.Options): PackageCore.JSX.Element;

		static Event: Self.MenuButton.EventTypes;

	}

	export namespace MenuButton {
		interface Options extends Self.Button.Options {
			children?: PackageCore.VDom.Children;

			menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu.Options);

			openOnHover?: boolean;

			menuTarget?: Self.Window.Target;

		}

		interface EventTypes extends Self.Button.EventTypes {
			MENU_OPENED: string;

			MENU_CLOSED: string;

		}

		export import Size = Self.Button.Size;

		export import IconPosition = Self.Button.IconPosition;

		export import Type = Self.Button.Type;

		export import Hierarchy = Self.Button.Hierarchy;

		export import VisualStyle = Self.Button.VisualStyle;

	}

	export class MenuGroup extends PackageCore.Component {
		constructor(options?: Self.MenuGroup.Options);

		children: PackageCore.VDom.Children;

		label: (string | PackageCore.Translation);

		private hasLabel: boolean;

		icon: (Self.Image.Source | null);

		private hasIcon: boolean;

		focusableItems: globalThis.Array<PackageCore.Component>;

		setIcon(icon: (Self.Image.Source | null)): void;

		setLabel(label: string): void;

	}

	export namespace MenuGroup {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<PackageCore.Component>;

			label?: (string | PackageCore.Translation);

			icon?: Self.Image.Source;

		}

	}

	export class MenuItem extends PackageCore.Component {
		constructor(options?: Self.MenuItem.Options);

		selected: boolean;

		highlighted: boolean;

		opened: boolean;

		submenu: Self.Menu;

		value: (any | Self.MenuItem);

		private _getActionHandler(): void;

		static CustomItem(definition: Self.MenuItem.CustomItemDefinition): Self.MenuItem;

		static ActionItem(definition: Self.MenuItem.ActionItemDefinition): Self.MenuItem;

		static LinkItem(definition: Self.MenuItem.LinkItemDefinition): Self.MenuItem;

	}

	export namespace MenuItem {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content: PackageCore.Component;

			highlighted?: boolean;

			value?: any;

			submenuItems?: globalThis.Array<object>;

		}

		interface BaseItemDefinition {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<Self.MenuItem.ItemDefinition>;

			highlighted?: boolean;

			visible?: boolean;

			enabled?: boolean;

			classList?: globalThis.Array<string>;

		}

		interface SubmenuItemDefinition extends Self.MenuItem.BaseItemDefinition {
			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation);

		}

		interface CustomItemDefinition extends Self.MenuItem.BaseItemDefinition {
			content?: (PackageCore.Component | PackageCore.VDom.Element);

			action: Self.MenuItemButton.ActionCallback;

		}

		interface ActionItemDefinition extends Self.MenuItem.BaseItemDefinition {
			icon?: Self.Image.Source;

			startIcon?: Self.Image.Source;

			endIcon?: Self.Image.Source;

			label?: (string | PackageCore.Translation);

			action: Self.MenuItemButton.ActionCallback;

			shortcut?: globalThis.Array<globalThis.Array<string>>;

		}

		interface LinkItemDefinition extends Self.MenuItem.BaseItemDefinition {
			icon?: Self.Image.Source;

			startIcon?: Self.Image.Source;

			endIcon?: Self.Image.Source;

			label?: (string | PackageCore.Translation);

			url?: string;

			route?: (string | PackageCore.Route | Self.Link.Route);

			target?: Self.Link.Target;

			shortcut?: globalThis.Array<globalThis.Array<string>>;

		}

		type ItemDefinition = (Self.MenuItem.SubmenuItemDefinition | Self.MenuItem.ActionItemDefinition | Self.MenuItem.LinkItemDefinition);

	}

	export class MenuItemButton extends PackageCore.Component {
		constructor(options?: Self.MenuItemButton.Options);

		protected _doAction(options: object): void;

		click(): void;

	}

	export namespace MenuItemButton {
		interface Options extends PackageCore.Component.Options {
			content: PackageCore.Component;

			action?: Self.MenuItemButton.ActionCallback;

		}

		type ActionCallback = (args: {reason: string}) => (boolean | void);

		enum Reason {
			KEY_UP,
			CLICK,
			TAP,
		}

	}

	export class MenuItemContent extends PackageCore.Component {
		constructor(options?: Self.MenuItemContent.Options);

		endIcon: (Self.Image.Source | null);

		startIcon: (Self.Image.Source | null);

		label: (string | PackageCore.Translation);

		hasLabel: boolean;

		icon: (Self.Image.Source | null);

		hasIcon: boolean;

		shortcut: string;

		hasShortcut: boolean;

		setLabel(label: string): void;

		setIcon(icon: object): void;

		setShortcut(shortcut: string): void;

		static getRefreshedStyles(theme: PackageCore.RefreshedTheme): void;

	}

	export namespace MenuItemContent {
		interface Options extends PackageCore.Component.Options {
			label?: (string | PackageCore.Translation);

			icon?: Self.Image.Source;

			startIcon?: Self.Image.Source;

			endIcon?: Self.Image.Source;

			shortcut?: string;

		}

	}

	namespace MenuOptions {
		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

		enum NavigationMode {
			CIRCULAR,
			START_END,
		}

		enum Reason {
			SUBMENU_ITEM_SELECTED,
			KEY_PRESS,
			MOUSE_ENTER,
			MOUSE_LEAVE,
			MOUSE_CLICK,
			TOUCH_TAP,
			CALL,
			CLEAR,
			FOCUS,
			ACTION,
		}

		enum Role {
			MENU,
			MENUBAR,
		}

		enum Size {
			DEFAULT,
			LARGE,
		}

		enum VisualStyle {
			DEFAULT,
			THEMED,
		}

		enum Type {
			DEFAULT,
			CONTEXT_MENU,
		}

	}

	export class MeterBar extends PackageCore.Component {
		constructor(options?: (Self.MeterBar.Options));

		type: Self.MeterBar.Type;

		value: number;

		min: number;

		max: number;

		step: number;

		readOnly: boolean;

		plotAreaColor: Self.MeterBar.ColorConfig;

		plotAreaSize: Self.MeterBar.Size;

		indicatorBarColor: Self.MeterBar.ColorConfig;

		indicatorBarSize: Self.MeterBar.Size;

		referenceLines: globalThis.Array<Self.MeterBar.ReferenceLine>;

		referenceLinesSize: Self.MeterBar.Size;

		onValueChanged: (Self.MeterBar.ValueChangedCallback | null);

		onValueAccepted: (Self.MeterBar.ValueAcceptedCallback | null);

		setValue(value: number, options: object): void;

		acceptChanges(options: object): void;

		static basicDynamicColor(errorToWarning: number, warningToSuccess: number): Self.MeterBar.ValueColorCallback;

		static basicColorSegments(errorToWarning: number, warningToSuccess: number): globalThis.Array<Self.MeterBar.SegmentColor>;

	}

	export namespace MeterBar {
		interface Options extends PackageCore.Component.Options {
			type?: Self.MeterBar.Type;

			value?: number;

			min?: number;

			max?: number;

			readOnly?: boolean;

			step?: number;

			plotAreaColor?: Self.MeterBar.ColorConfig;

			plotAreaSize?: Self.MeterBar.Size;

			indicatorBarColor?: Self.MeterBar.ColorConfig;

			indicatorBarSize?: Self.MeterBar.Size;

			referenceLines?: globalThis.Array<Self.MeterBar.ReferenceLine>;

			referenceLinesSize?: Self.MeterBar.Size;

			onValueChanged?: Self.MeterBar.ValueChangedCallback;

			onValueAccepted?: Self.MeterBar.ValueAcceptedCallback;

		}

		type ColorConfig = (Self.MeterBar.Color | Self.MeterBar.ValueColorCallback | globalThis.Array<Self.MeterBar.SegmentColor>);

		interface SegmentColor {
			min?: number;

			max?: number;

			color: Self.MeterBar.Color;

		}

		interface ReferenceLine {
			value: number;

			color: Self.MeterBar.Color;

		}

		type ValueColorCallback = (value: number) => Self.MeterBar.Color;

		type ValueChangedCallback = (args: Self.MeterBar.ValueChangedCallbackArgs) => void;

		interface ValueChangedCallbackArgs {
			value: number;

			previousValue: number;

			reason: Self.MeterBar.Reason;

		}

		type ValueAcceptedCallback = (args: Self.MeterBar.ValueAcceptedCallbackArgs) => void;

		interface ValueAcceptedCallbackArgs {
			acceptedValue: number;

			previousAcceptedValue: number;

			reason: Self.MeterBar.Reason;

		}

		enum Type {
			HORIZONTAL,
			VERTICAL,
		}

		enum Size {
			LARGE,
			MEDIUM,
			SMALL,
		}

		enum Color {
			NEUTRAL,
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

		enum Reason {
			VALUE_CHANGED,
			VALUE_ACCEPTED,
		}

	}

	export class MeterCircle extends PackageCore.Component {
		constructor(options?: (Self.MeterCircle.Options));

		type: Self.MeterCircle.Type;

		value: number;

		min: number;

		max: number;

		step: number;

		readOnly: boolean;

		plotAreaColor: Self.MeterCircle.ColorConfig;

		plotAreaSize: Self.MeterCircle.Size;

		indicatorBarColor: Self.MeterCircle.ColorConfig;

		indicatorBarSize: Self.MeterCircle.Size;

		referenceLines: globalThis.Array<Self.MeterCircle.ReferenceLine>;

		referenceLinesSize: Self.MeterCircle.Size;

		onValueChanged: (Self.MeterCircle.ValueChangedCallback | null);

		onValueAccepted: (Self.MeterCircle.ValueAcceptedCallback | null);

		setValue(value: number, options: object): void;

		acceptChanges(options: object): void;

		static basicDynamicColor(errorToWarning: number, warningToSuccess: number): Self.MeterCircle.ValueColorCallback;

		static basicColorSegments(errorToWarning: number, warningToSuccess: number): globalThis.Array<Self.MeterCircle.SegmentColor>;

	}

	export namespace MeterCircle {
		interface Options extends PackageCore.Component.Options {
			type?: Self.MeterCircle.Type;

			value?: number;

			min?: number;

			max?: number;

			readOnly?: boolean;

			step?: number;

			plotAreaColor?: Self.MeterCircle.ColorConfig;

			plotAreaSize?: Self.MeterCircle.Size;

			indicatorBarColor?: Self.MeterCircle.ColorConfig;

			indicatorBarSize?: Self.MeterCircle.Size;

			referenceLines?: globalThis.Array<Self.MeterCircle.ReferenceLine>;

			referenceLinesSize?: Self.MeterCircle.Size;

			onValueChanged?: Self.MeterCircle.ValueChangedCallback;

			onValueAccepted?: Self.MeterCircle.ValueAcceptedCallback;

		}

		type ColorConfig = (Self.MeterCircle.Color | Self.MeterCircle.ValueColorCallback | globalThis.Array<Self.MeterCircle.SegmentColor>);

		interface SegmentColor {
			min?: number;

			max?: number;

			color: Self.MeterCircle.Color;

		}

		interface ReferenceLine {
			value: number;

			color: Self.MeterCircle.Color;

		}

		type ValueColorCallback = (value: number) => Self.MeterCircle.Color;

		type ValueChangedCallback = (args: Self.MeterCircle.ValueChangedCallbackArgs) => void;

		interface ValueChangedCallbackArgs {
			value: number;

			previousValue: number;

			reason: Self.MeterCircle.Reason;

		}

		type ValueAcceptedCallback = (args: Self.MeterCircle.ValueAcceptedCallbackArgs) => void;

		interface ValueAcceptedCallbackArgs {
			acceptedValue: number;

			previousAcceptedValue: number;

			reason: Self.MeterCircle.Reason;

		}

		enum Type {
			CIRCULAR,
			SEMI_CIRCULAR,
		}

		enum Size {
			LARGE,
			MEDIUM,
			SMALL,
		}

		enum Color {
			NEUTRAL,
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

		enum Reason {
			VALUE_CHANGED,
			VALUE_ACCEPTED,
		}

	}

	export class Metric extends PackageCore.Component {
		title: (string | number | PackageCore.Translation);

		metric: (string | number | PackageCore.Translation);

		metadata: (string | number | PackageCore.Translation);

		description: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		children: PackageCore.VDom.Children;

		toolbar: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

	}

	export namespace Metric {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			title: (string | number | PackageCore.Translation);

			metric: (string | number | PackageCore.Translation);

			metadata?: (string | number | PackageCore.Translation);

			description?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			toolbar?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

		}

	}

	export class Modal extends Self.Window {
		constructor(options: Self.Modal.Options);

		withTitleBar: boolean;

		title: (string | number | PackageCore.Translation);

		titleIcon: Self.Image.Source;

		closeButton: boolean;

		maximizeButton: boolean;

		draggable: boolean;

		size: Self.Modal.Size;

		static createAlert(args: Self.Modal.AlertOptions): Self.Modal;

		static createConfirm(args: Self.Modal.ConfirmOptions): Self.Modal;

		/**
		 * @deprecated
		 */
		static DeprecatedNoOwner: object;

	}

	export namespace Modal {
		interface Options extends Self.Window.Options {
			withTitleBar?: boolean;

			title?: (string | number | PackageCore.Translation);

			titleIcon?: Self.Image.Source;

			maximizeButton?: boolean;

			closeButton?: boolean;

			draggable?: boolean;

			size?: Self.Modal.Size;

		}

		interface AlertOptions extends Self.Modal.Options {
			onOk?: (args: Self.Button.ActionArgs) => void;

		}

		interface ConfirmOptions extends Self.Modal.Options {
			onOk?: (args: Self.Button.ActionArgs) => void;

			onCancel?: (args: Self.Button.ActionArgs) => void;

		}

		export import CloseStrategy = Self.WindowCloseStrategy;

		enum Size {
			DEFAULT,
			SMALL,
			MEDIUM,
			LARGE,
		}

		export import ButtonsJustification = Self.Window.ButtonsJustification;

		export import CloseReason = Self.Window.CloseReason;

		export import State = Self.Window.State;

		export import Event = Self.Window.Event;

		export import GapSize = Self.Window.GapSize;

	}

	export class MultiselectDropdown extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.MultiselectDropdown.Options);

		selectedItems: globalThis.Array<any>;

		dataSource: PackageCore.DataSource;

		activeTagIndex: boolean;

		dropDownOpened: boolean;

		textBox: (Self.TextBox | null);

		picker: (Self.ListBoxPicker.Options | null);

		openDropDownOnClick: boolean;

		openDropDownOnFocus: boolean;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		empty: boolean;

		mandatory: boolean;

		size: Self.MultiselectDropdown.Size;

		onSelectionChanged: (Self.MultiselectDropdown.SelectionChangedCallback | null);

		setSelectedItems(items: (globalThis.Array<any> | any), options?: {reason?: string}): void;

		setActiveTagIndex(index: (number | null)): void;

		add(items: (globalThis.Array<any> | any), options?: {reason?: string}): void;

		remove(items: (globalThis.Array<any> | any), options?: {reason?: string}): void;

		openDropDown(args?: Self.MultiselectDropdown.ReasonObject): void;

		closeDropDown(args?: Self.MultiselectDropdown.ReasonObject): void;

		toggleDropDown(args?: Self.MultiselectDropdown.ReasonObject): void;

		acceptChanges(): void;

		private setPickerSelection(items: (globalThis.Array<any> | null)): void;

		private createTagsBox(): PackageCore.JSX.Element;

		private handleTagsBoxTagRemoved(args: {item: any; reason: (string | symbol)}): void;

		private handleTagsBoxSelectedTagIndexChanged(args: {index: (number | null); item: any; reason: (string | symbol)}): void;

		private createTag(value: object): object;

		private createTextBox(): PackageCore.JSX.Element;

		private handleTextBoxActivated(): void;

		private handleTextBoxTextChanged(args: object): void;

		private createPicker(): Self.Picker;

		private setupPicker(options: object): Self.Picker;

		private createDefaultPicker(options: Self.ListBoxPicker.Options): Self.ListBoxPicker;

		private handlePickerOpening(): void;

		private handlePickerOpened(): void;

		private handlePickerClosing(): void;

		private handlePickerClosed(): void;

		private handlePickerSelectionChanged(args: object): void;

		private createChevron(): PackageCore.JSX.Element;

		private changeSelection(selection: globalThis.Array<any>, args: {reason: (string | symbol)}): void;

		private selectItems(selection: globalThis.Array<any>, addedItems: globalThis.Array<any>): globalThis.Array<any>;

		private unselectItems(selection: globalThis.Array<any>, removedItems: globalThis.Array<any>): globalThis.Array<any>;

		private containsItem(array: globalThis.Array<any>, item: any, comparator: (left: any, right: any) => boolean): boolean;

		private compareSelections(left: globalThis.Array<any>, right: globalThis.Array<any>): boolean;

		static Event: Self.MultiselectDropdown.EventTypes;

	}

	export namespace MultiselectDropdown {
		interface Options extends PackageCore.Component.Options {
			activeTagIndex?: (number | null);

			allowEmpty?: boolean;

			ariaLabel?: string;

			dataSource?: PackageCore.DataSource;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			noDataMessage?: string;

			openDropDownOnClick?: boolean;

			openDropDownOnFocus?: boolean;

			placeholder?: string;

			selectedItems?: globalThis.Array<any>;

			showSelectionBar?: boolean;

			textBoxOptions?: Self.TextBox.Options;

			valueMember?: (string | null);

			mandatory?: boolean;

			tagDisplayMember?: Self.DataSourceComponent.DisplayMember;

			tagMaxWidth?: number;

			picker?: Self.ListBoxPicker.Options;

			size?: Self.MultiselectDropdown.Size;

			onSelectionChanged?: Self.MultiselectDropdown.SelectionChangedCallback;

			comparator?: Self.MultiselectDropdown.ComparatorCallback;

			clearFilterOnFocusOut?: boolean;

		}

		type SelectionChangedCallback = (args: Self.MultiselectDropdown.SelectionChangedArgs, sender: Self.MultiselectDropdown) => void;

		type ComparatorCallback = (left: any, right: any) => boolean;

		interface SelectionChangedArgs {
			values: globalThis.Array<any>;

			previousValues: globalThis.Array<any>;

			reason: Self.MultiselectDropdown.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_ITEMS_CHANGED: string;

			ACTIVE_TAG_INDEX_CHANGED: string;

			PICKER_OPENING: string;

			PICKER_OPENED: string;

			PICKER_CLOSING: string;

			PICKER_CLOSED: string;

		}

		interface SelectiveDataObject {
			addItems?: (any | globalThis.Array<any>);

			removeItems?: (any | globalThis.Array<any>);

			reason?: string;

		}

		interface ReasonObject {
			reason?: string;

		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
			REDWOOD_FIELD,
		}

		enum Reason {
			CALL,
			PICKER_CLOSED,
			AUTO_SUGGEST_DATA_CHANGED,
			COMPONENT_FOCUSED,
			API_INVOKED,
			TAG_REMOVED,
		}

		enum I18N {
			NO_DATA_AVAILABLE,
		}

		export import Size = Self.InputSize;

		export import Tag = Self.MultiselectDropdownTag;

		export import TagsBox = Self.MultiselectDropdownTagsBox;

	}

	export class MultiselectDropdownCell extends Self.GridCell {
		constructor();

		dataSource: PackageCore.DataSource;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		multiselectDropdown: (Self.MultiselectDropdown | null);

		widgetOptions: (Self.MultiselectDropdown.Options | Self.GridCell.WidgetOptionsCallback<Self.MultiselectDropdown.Options> | null);

		setDataSource(dataSource: (PackageCore.DataSource | null)): void;

	}

	export namespace MultiselectDropdownCell {
	}

	export class MultiselectDropdownColumn extends Self.GridColumn {
		constructor(options: Self.MultiselectDropdownColumn.Options);

		dataSource: (PackageCore.DataSource | null);

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		widgetOptions: (Self.MultiselectDropdown.Options | Self.GridColumn.WidgetOptionsCallback<Self.MultiselectDropdown.Options> | null);

	}

	export namespace MultiselectDropdownColumn {
		interface Options extends Self.GridColumn.Options {
			dataSource?: PackageCore.DataSource;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			widgetOptions?: (Self.MultiselectDropdownColumn.Options | Self.GridColumn.WidgetOptionsCallback<Self.MultiselectDropdownColumn.Options>);

			dataSourceConfigurator?: Self.MultiselectDropdownColumn.DataSourceConfiguratorCallback;

		}

		type DataSourceConfiguratorCallback = (row: Self.GridDataRow) => (PackageCore.DataSource | null);

		export import Cell = Self.MultiselectDropdownCell;

	}

	export class MultiselectDropdownTag extends PackageCore.Component {
		constructor(options?: Self.MultiselectDropdownTag.Options);

		label: string;

		selected: boolean;

		removable: boolean;

		setSelected(value: boolean, options?: object): void;

		select(reason?: string): void;

		unselect(reason?: string): void;

		toggle(reason?: string): void;

		setLabel(label: string): void;

		toggleRemovable(): void;

		setRemovable(value: boolean): void;

		private createLabel(): Self.Text;

		private createRemoveButton(): Self.Image;

		static Event: Self.MultiselectDropdownTag.EventTypes;

	}

	export namespace MultiselectDropdownTag {
		interface Options extends PackageCore.Component.Options {
			clickable?: boolean;

			maxWidth?: number;

			label: (string | number | PackageCore.Translation);

			removable?: boolean;

			removeIconLabel?: (string | number | PackageCore.Translation | null);

			removeIconSize?: number;

			selected?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

			REMOVED: string;

		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
			REDWOOD_FIELD,
		}

		enum ToggledReason {
			CALL,
			CLICK,
		}

		enum I18N {
			REMOVE_ICON_LABEL,
		}

	}

	export class MultiselectDropdownTagsBox extends PackageCore.Component {
		constructor(options?: Self.MultiselectDropdownTagsBox.Options);

		tags: globalThis.Array<any>;

		selectedTagIndex: (number | null);

		setTags(tags: globalThis.Array<any>): void;

		setSelectedTagIndex(index: (number | null), options?: object): void;

		private createTagsBox(): Self.StackPanel;

		private createTag(item: object, index: number): Self.MultiselectDropdownTag;

		private removeTag(index: number): void;

		private handleTagToggled(index: number, args: object): void;

		private scrollToSelectedTag(): void;

		private notifyTagRemoved(item: object, reason: string): void;

		private notifySelectedTagIndexChanged(reason: string): void;

		static TAG_REMOVED_DEFAULT_REASON: string;

		static Event: Self.MultiselectDropdownTagsBox.EventTypes;

	}

	export namespace MultiselectDropdownTagsBox {
		interface Options extends PackageCore.Component.Options {
			tags?: globalThis.Array<any>;

			selectedTagIndex?: (number | null);

			tagMaxWidth?: number;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TAG_REMOVED: string;

			SELECTED_TAG_INDEX_CHANGED: string;

		}

		enum SelectedTagIndexChangedReason {
			DEFAULT,
			TAG_CLICKED,
		}

	}

	export class NavigationDrawer extends PackageCore.Component {
		constructor(options?: Self.NavigationDrawer.Options);

		items: globalThis.Array<Self.NavigationDrawerItem>;

		children: PackageCore.VDom.Children;

		selectedValue: (any | null);

		selectedItem: (Self.NavigationDrawerItem | null);

		collapsed: boolean;

		collapsible: boolean;

		header: (PackageCore.Component | PackageCore.JSX.Element);

		headerAlignment: Self.NavigationDrawer.HeaderAlignment;

		onSelectedValueChanged: Self.NavigationDrawer.SelectedValueChangedCallback;

		width: (number | string | null);

		selectActiveRoute: boolean;

		onBeforeItemSelected: Self.NavigationDrawer.BeforeItemSelectedCallback;

		setSelectedItem(selectedItem: (Self.NavigationDrawerItem | null), options: {reason?: (string | symbol)}): void;

		setSelectedValue(value: any, options: {reason?: (string | symbol)}): void;

		setItems(items: globalThis.Array<Self.NavigationDrawer.ItemOptions>): void;

		visitItems(callback: (item: Self.NavigationDrawerItem) => void): void;

		private setItemIndexes(): void;

		private getCollapseButtonTooltipText(): PackageCore.Translation;

		private renderCollapseButton(): PackageCore.JSX.Element;

		private renderChildren(): globalThis.Array<PackageCore.JSX.Element>;

		private renderChild(child: PackageCore.JSX.Element, level: number, isVisible: boolean): PackageCore.JSX.Element;

		private mapVisibleItems(): void;

		private setFocusIndex(): void;

		static Event: Self.NavigationDrawer.EventTypes;

	}

	export namespace NavigationDrawer {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			collapsed?: boolean;

			collapsible?: boolean;

			items?: globalThis.Array<Self.NavigationDrawer.ItemOptions>;

			selectedValue?: any;

			width?: (number | string);

			selectActiveRoute?: boolean;

			onSelectedValueChanged?: Self.NavigationDrawer.SelectedValueChangedCallback;

			onBeforeItemSelected?: Self.NavigationDrawer.BeforeItemSelectedCallback;

		}

		interface ItemOptions {
			value: any;

			selected?: boolean;

			action?: () => void;

			url?: string;

			route?: (string | PackageCore.Route | Self.Link.Route);

			items?: globalThis.Array<Self.NavigationDrawer.ItemOptions>;

			badge?: (string | number | PackageCore.Translation);

			badgeStatus?: PackageCore.Component.Status;

			enabled?: boolean;

			icon?: Self.Image.Source;

			separatorTop?: boolean;

			separatorBottom?: boolean;

			header?: (PackageCore.Component | PackageCore.JSX.Element);

			headerAlignment?: Self.NavigationDrawer.HeaderAlignment;

		}

		type SelectedValueChangedCallback = (args: Self.NavigationDrawer.SelectedValueChangedCallbackArgs) => void;

		interface SelectedValueChangedCallbackArgs {
			value: any;

			previousValue: any;

			reason: (string | symbol);

		}

		type BeforeItemSelectedCallback = (args: Self.NavigationDrawer.BeforeItemSelectedCallbackArgs) => boolean;

		interface BeforeItemSelectedCallbackArgs {
			value: any;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_VALUE_CHANGED: symbol;

			ITEM_SELECTED: string;

			COLLAPSED: string;

		}

		enum VisualStyle {
			DEFAULT,
			LIGHT,
			DARK,
		}

		enum Reason {
			CALL,
			UPDATE,
			ROUTE_UPDATE,
		}

		enum HeaderAlignment {
			CENTER,
			START,
			END,
			STRETCH,
		}

		export import Item = Self.NavigationDrawerItem;

	}

	export class NavigationDrawerItem extends PackageCore.Component {
		constructor(options?: Self.NavigationDrawerItem.Options);

		items: globalThis.Array<Self.NavigationDrawerItem>;

		children: PackageCore.VDom.Children;

		value: any;

		label: (string | number | PackageCore.Translation);

		url: (string | null);

		/**
		 * @deprecated Use url instead of link
		 */
		link: (string | null);

		route: (string | PackageCore.Route | Self.Link.Route | null);

		action: () => void;

		icon: Self.Image.Source;

		badge: (string | number | PackageCore.Translation);

		badgeStatus: PackageCore.Component.Status;

		selected: boolean;

		highlighted: boolean;

		expanded: boolean;

		dataItem: (Self.NavigationDrawer.ItemOptions);

		parent: (Self.NavigationDrawerItem | null);

		content: (PackageCore.Component | PackageCore.JSX.Element);

		separatorTop: boolean;

		separatorBottom: boolean;

		setSelected(selected: boolean, reason: symbol): void;

		private setExpanded(expanded: boolean, reason: symbol): void;

		update(properties: object): void;

		click(): void;

		isTopLevel(): boolean;

		getTopLevelParent(): Self.NavigationDrawerItem;

		scrollIntoView(alignment?: Self.NavigationDrawerItem.ScrollAlignment): void;

		static Event: Self.NavigationDrawerItem.EventTypes;

	}

	export namespace NavigationDrawerItem {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			value?: any;

			action?: () => void;

			badge?: (string | number | PackageCore.Translation);

			badgeStatus?: PackageCore.Component.Status;

			icon?: Self.Image.Source;

			label?: (string | number | PackageCore.Translation);

			url?: string;

			route?: (string | PackageCore.Route | Self.Link.Route);

			selected?: boolean;

			visible?: boolean;

			separatorTop?: boolean;

			separatorBottom?: boolean;

			content?: (PackageCore.Component | PackageCore.JSX.Element);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			CLICKED: symbol;

			SELECTED: symbol;

			EXPANDED: symbol;

			HIGHLIGHTED: symbol;

		}

		enum ScrollAlignment {
			START,
			END,
			NEAREST,
		}

	}

	export class NetsuiteSystemHeader extends PackageCore.Component {
		constructor(options?: Self.NetsuiteSystemHeader.Options);

		logos: globalThis.Array<PackageCore.JSX.Element>;

		environment: Self.NetsuiteSystemHeader.Environment;

		roleColor: Self.NetsuiteSystemHeader.RoleColor;

	}

	export namespace NetsuiteSystemHeader {
		interface Options extends PackageCore.Component.Options {
			feedbackButtonOptions?: Self.Button.Options;

			helpButtonOptions?: Self.Button.Options;

			logos?: globalThis.Array<PackageCore.JSX.Element>;

			navigationMenuOptions?: Self.NetsuiteSystemHeader.HeaderNavigationOptions;

			quickMenuOptions?: Self.NetsuiteSystemHeader.HeaderMenuOptions;

			roleMenuOptions?: Self.NetsuiteSystemHeader.HeaderMenuOptions;

			searchOptions?: Self.NetsuiteSystemHeader.HeaderSearchOptions;

			languageSelectorOptions?: Self.NetsuiteSystemHeader.LanguageSelectorOptions;

			roleColor?: Self.NetsuiteSystemHeader.RoleColor;

			environment?: Self.NetsuiteSystemHeader.Environment;

		}

		interface HeaderMenuOptions {
			icon?: Self.Image.Source;

			label?: Self.NetsuiteSystemHeader.HeaderMenuLabel;

			menuItems?: globalThis.Array<Self.MenuItem>;

			url?: string;

		}

		interface HeaderSearchOptions {
			options?: Self.SystemSearch.Options;

			systemSearch?: Self.SystemSearch;

			placeholder?: string;

			searchString?: string;

		}

		interface LanguageSelectorOptions {
			languages?: globalThis.Array<Self.NetsuiteSystemHeader.LanguageOption>;

			selectedLanguage?: Self.NetsuiteSystemHeader.LanguageOption;

			onLanguageChange?: () => void;

		}

		interface LanguageOption {
			id?: string;

			value?: string;

		}

		interface HeaderNavigationOptions {
			getDynamicItems?: () => globalThis.Promise<any>;

			items?: globalThis.Array<Self.MenuItem>;

		}

		interface HeaderMenuLabel {
			heading?: string;

			subHeading?: string;

		}

		enum Icons {
			SANDBOX,
			RELEASE_PREVIEW,
			HELP,
			FEEDBACK,
			CREATE_NEW_RECORD,
			SIGN_OUT,
			CURRENT_ROLE,
			ROLES,
		}

		enum RoleColor {
			DEFAULT,
			BLACK,
			GRAY,
			BROWN,
			ORANGE,
			MOSS_GREEN,
			GREEN,
			LIGHT_BLUE,
			TURQUOISE,
			PURPLE,
			PINK,
			RED,
		}

		enum Environment {
			PRODUCTION,
			RELEASE_PREVIEW,
			SANDBOX,
			F,
			SNAP,
			DEBUGGER,
		}

	}

	export function PageRoot(props: object): PackageCore.JSX.Element;

	class PageSearch {
		addItem(item: Self.PageSearch.SearchableItem, options: Self.PageSearch.SearchableItemOptions): void;

		addItems(items: globalThis.Array<Self.PageSearch.SearchableItem>, options: Self.PageSearch.SearchableItemOptions): void;

		removeItem(itemId: string): void;

	}

	namespace PageSearch {
		interface SearchableItem {
			id: string;

			label: string;

			action: () => void;

		}

		interface SearchableItemOptions {
			category: Self.SearchItemCategory;

			idProperty?: string;

			actionProperty?: string;

			labelProperty?: string;

			nestedArrayProperty?: string;

		}

	}

	export class Pagination extends PackageCore.Component {
		constructor(options?: Self.Pagination.Options);

		selectedPageIndex: number;

		selectedPage: object;

		pages: Self.Pagination.Pages;

		pageItems: globalThis.Array<object>;

		rows: (object | null);

		rowsPerPage: (number | null);

		rowsCount: (number | null);

		rowsPerPageSelector: (Self.Pagination.RowsPerPageSelectorObject | null);

		navigation: (Self.Pagination.Navigation | null);

		rowsCounter: (Self.Pagination.RowsCounter | number | string | null);

		loadMore: (number | null);

		onPageSelected: (Self.Pagination.PageSelectedCallback | null);

		setSelectedPageIndex(pageIndex: number, options?: Self.Pagination.SetterOptions): void;

		setRowsPerPage(rowsPerPage: number, options?: Self.Pagination.SetterOptions): void;

		setRowsCount(rowsCount: number, options: Self.Pagination.SetterOptions): void;

		setPages(pages: Self.Pagination.Pages, options: Self.Pagination.SetterOptions): void;

		private handlePaginationChanged(reason?: symbol, oldProperties?: object): void;

		private parsePages(pages: Self.Pagination.Pages): void;

		private parseRowsSettings(pages: Self.Pagination.Pages): (object | null);

		private parsePagesSettings(pages: Self.Pagination.Pages): globalThis.Array<object>;

		private parsePagesNumber(pageNumber: number): globalThis.Array<object>;

		private parsePagesArray(pageArray: (globalThis.Array<string> | globalThis.Array<object>)): globalThis.Array<object>;

		private parsePagesObject(pageObject: object): globalThis.Array<object>;

		private renderLayout(): globalThis.Array<PackageCore.Component>;

		private renderRowsPerPageSelector(): (Self.StackPanel | null);

		private renderRowsPerPageSelectorTextBox(): Self.TextBox;

		private renderRowsPerPageSelectorDropdown(): Self.Dropdown;

		private renderRowsPerPageSelectorDropdownData(): PackageCore.ArrayDataSource;

		private renderNavigation(): (Self.StackPanel | null);

		private renderNavigationSegmentation(): (Self.StackPanel | null);

		private renderNavigationPageIndicator(): (Self.Text | Self.TextBox | Self.Dropdown | null);

		private renderNavigationPageIndicatorEditable(): (Self.TextBox | Self.Dropdown);

		private renderNavigationPageIndicatorDropdown(): Self.Dropdown;

		private renderNavigationPageIndicatorTextBox(): Self.TextBox;

		private renderNavigationPageIndicatorStatic(): Self.Text;

		private handleNavigationPageIndicatorTextBoxEdited(args: object): void;

		private renderNavigationButtons(): (Self.StackPanel | null);

		private renderNavigationTotal(): (Self.Text | Self.Button);

		private renderNavigationTotalLabel(): string;

		private renderNavigationTotalButton(label: string, firstPage: boolean, lastPage: boolean): Self.Button;

		private renderNavigationTotalText(label: string): Self.Text;

		private renderNavigationButtonsList(): (Self.List | null);

		private renderNavigationButtonPrevious(): Self.Button;

		private renderNavigationButtonNext(): Self.Button;

		private renderNavigationPageList(): globalThis.Array<PackageCore.JSX.Element>;

		private handleNavigationPageListClick(pageIndex: number): void;

		private renderRowsCounter(): (Self.Text | null);

		private renderRowsCounterTotal(number?: number): Self.Text;

		private renderRowsCounterTotalText(number?: any): string;

		private renderRowsCounterComplete(): Self.Text;

		private renderRowsCounterCompleteText(): string;

		private renderRowsCounterUnknown(): Self.Text;

		private renderRowsCounterUnknownText(): string;

		private renderRowsCounterCustom(): Self.Text;

		private renderLoadMoreButton(): (Self.Button | null);

		private handleLoadMoreButtonClick(): void;

		private notifySelectedPageIndexChanged(previousIndex: number, reason: string): void;

		private parseNavigationSettings(navigation: Self.Pagination.Navigation): (Self.Pagination.Navigation | null);

		private parseLegacyNavigationSettings(navigation: object): void;

		static default(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static Default(props: Self.Pagination.Options): Self.Pagination;

		static withTotal(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static WithTotal(props: Self.Pagination.Options): Self.Pagination;

		static editable(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static Editable(props: Self.Pagination.Options): Self.Pagination;

		static segmentation(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static Segmentation(props: Self.Pagination.Options): Self.Pagination;

		static pageIndicatorSegmentation(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static PageIndicatorSegmentation(props: Self.Pagination.Options): Self.Pagination;

		static pageList(pages: Self.Pagination.Pages, options?: Self.Pagination.Options): Self.Pagination;

		static PageList(props: Self.Pagination.Options): Self.Pagination;

		static Event: Self.Pagination.EventTypes;

	}

	export namespace Pagination {
		type Pages = (number | Self.Pagination.RowsObject | globalThis.Array<string> | globalThis.Array<object>);

		interface RowsObject {
			rowsCount: number;

			rowsPerPage: number;

		}

		interface RowsPerPageSelectorObject {
			all?: boolean;

			data?: globalThis.Array<number>;

			type: Self.Pagination.RowsPerPageSelector;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_PAGE_CHANGED: symbol;

			PAGINATION_CHANGED: symbol;

		}

		interface Navigation {
			buttons?: (Self.Pagination.NavigationButtons | boolean);

			pageIndicator?: (Self.Pagination.NavigationPageIndicator | boolean);

			pageList?: boolean;

			segmentation?: boolean;

			type: Self.Pagination.NavigationType;

			segmentationWidth?: (number | string);

		}

		interface NavigationPageIndicator {
			editable: boolean;

		}

		interface NavigationButtons {
			firstPage?: boolean;

			previousPage?: boolean;

			nextPage?: boolean;

			lastPage?: boolean;

			total?: boolean;

		}

		interface SetterOptions {
			reason?: symbol;

			focus?: NavigationPageListElement;

		}

		interface Options extends PackageCore.Component.Options {
			pages?: Self.Pagination.Pages;

			rowsPerPageSelector?: Self.Pagination.RowsPerPageSelectorObject;

			navigation?: Self.Pagination.Navigation;

			rowsCounter?: (Self.Pagination.RowsCounter | number | string);

			loadMore?: number;

			order?: globalThis.Array<Self.Pagination.Section>;

			selectedPageIndex?: number;

			onPageSelected?: Self.Pagination.PageSelectedCallback;

		}

		type PageSelectedCallback = (args: Self.Pagination.PageSelectedArgs, sender: Self.Pagination) => void;

		interface PageSelectedArgs {
			page: any;

			index: number;

			previousPage: any;

			previousIndex: number;

			reason: Self.Pagination.Reason;

		}

		enum RowsCounter {
			COMPLETE,
			TOTAL,
			UNKNOWN,
			CUSTOM,
			NONE,
		}

		enum RowsPerPageSelector {
			INPUT,
			LIST,
		}

		enum Reason {
			UPDATE,
			CALL,
		}

		enum NavigationType {
			PAGE,
			ROWS_RANGE,
		}

		enum NavigationPageListElement {
			PREVIOUS,
			NEXT,
			CURRENT,
		}

		enum I18N {
			OF,
			TOTAL,
			UNKNOWN,
			SHOW,
			GO_TO,
			LOAD_MORE,
			ALL,
			FIRST_PAGE,
			PREVIOUS_PAGE,
			NEXT_PAGE,
			LAST_PAGE,
		}

		enum Section {
			ROWS_PER_PAGE_SELECTOR,
			NAVIGATION,
			ROWS_COUNTER,
			LOAD_MORE_BUTTON,
		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
		}

	}

	export class Paragraph extends PackageCore.Component {
		constructor(options?: Self.Paragraph.Options);

		content: (string | PackageCore.Component | globalThis.Array<(string | PackageCore.Component)>);

		children: PackageCore.VDom.Children;

		type: Self.Paragraph.Type;

		textAlignment: Self.Paragraph.TextAlignment;

		setType(type: Self.Paragraph.Type): void;

		setContent(content: (string | PackageCore.Component | globalThis.Array<(string | PackageCore.Component)>)): void;

	}

	export namespace Paragraph {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (null | string | PackageCore.Translation | PackageCore.Component | globalThis.Array<(string | PackageCore.Translation | PackageCore.Component)>);

			textAlignment?: Self.Paragraph.TextAlignment;

			type?: Self.Paragraph.Type;

		}

		enum Type {
			REGULAR,
			SMALL,
			LEAD,
			BOLD,
			WEAK,
		}

		enum TextAlignment {
			LEFT,
			CENTER,
			RIGHT,
			JUSTIFY,
		}

		enum VisualStyle {
			STANDALONE,
			EMBEDDED,
		}

	}

	export class Picker implements PackageCore.EventSource, PackageCore.MessageHandler {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options?: Self.Picker.Options);

		window: Self.Window;

		content: PackageCore.Component;

		opened: boolean;

		open(args?: object): void;

		close(args?: object): void;

		resize(args?: object): void;

		dispose(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

		setInputAttribute(name: string, value: string): void;

		removeInputAttribute(name: string): void;

		private _changeSelection(args?: object): void;

		private _openWindow(args: (object | null)): void;

		protected _createContent(args: object): PackageCore.Component;

		private _createWindow(): Self.Window;

		private _nextToken(): object;

		private _handleWindowOpening(): void;

		private _handleWindowOpened(): void;

		private _handleWindowClosing(): void;

		private _handleWindowClosed(): void;

		private _handlePickerUpdated(): void;

		static Event: Self.Picker.EventTypes;

	}

	export namespace Picker {
		interface Options {
			window?: Omit<Self.Popover.Options, "owner">;

			openConfiguration?: (options: Self.Window.OpenArgs) => Self.Window.OpenArgs;

			owner?: PackageCore.Component;

			input?: PackageCore.Component;

			on?: PackageCore.EventSource.ListenerMap;

		}

		interface EventTypes {
			OPENING: string;

			OPENED: string;

			CLOSING: string;

			CLOSED: string;

			SELECTION_CHANGED: string;

			UPDATED: string;

		}

		enum Reason {
			CALL,
			DISPOSE,
			ESC,
			ENTER,
			UPDATE,
			CLEAR,
		}

		export import CloseReason = Self.WindowCloseReason;

	}

	export class Placeholder extends PackageCore.Component {
		constructor(options?: Self.Placeholder.Options);

		text: Self.Kpi.Color;

	}

	export namespace Placeholder {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			text: string;

		}

	}

	export class Popover extends Self.Window {
		constructor(options: Self.Popover.Options);

		closeButton: boolean;

		size: Self.Popover.Size;

		static withOk(args: Self.Popover.Options): void;

		static createAlert(args: Self.Popover.AlertOptions): Self.Popover;

		static createConfirm(args: Self.Popover.ConfirmOptions): Self.Popover;

		static DefaultPlacementOffset: number;

	}

	export namespace Popover {
		interface Options extends Self.Window.Options {
			closeButton?: boolean;

			size?: Self.Popover.Size;

		}

		interface AlertOptions extends Self.Popover.Options {
			onOk?: Self.Button.ActionCallback;

		}

		interface ConfirmOptions extends Self.Popover.Options {
			onOk?: Self.Button.ActionCallback;

			onCancel?: Self.Button.ActionCallback;

		}

		enum Size {
			DEFAULT,
			SMALL,
			MEDIUM,
			MAX_SMALL,
			MAX_MEDIUM,
		}

		export import ButtonsJustification = Self.Window.ButtonsJustification;

		export import CloseStrategy = Self.WindowCloseStrategy;

		export import CloseReason = Self.Window.CloseReason;

		export import Event = Self.Window.Event;

		export import GapSize = Self.Window.GapSize;

		export import Position = Self.Window.Position;

	}

	export class Portlet extends PackageCore.Component {
		constructor(options?: Self.Portlet.Options);

		title: string;

		description: string;

		icon: Self.Image.Source;

		color: Self.Portlet.Color;

		content: (PackageCore.Component | PackageCore.JSX.Element);

		controls: globalThis.Array<(Self.Button.Options | Self.MenuButton.Options)>;

		collapsible: boolean;

		collapsed: boolean;

		children: PackageCore.VDom.Children;

		hasHeader: boolean;

		static Event: Self.Portlet.EventTypes;

	}

	export namespace Portlet {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			title?: (string | number | PackageCore.Translation);

			description?: (string | number | PackageCore.Translation);

			icon?: Self.Image.Source;

			color?: Self.Portlet.Color;

			controls?: globalThis.Array<(Self.Button.Options | Self.MenuButton.Options)>;

			collapsible?: boolean;

			collapsed?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			COLLAPSED: string;

		}

		enum Color {
			NONE,
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			THEMED,
		}

	}

	class ProjectParser {
		constructor();

	}

	namespace ProjectParser {
	}

	export class PromotionService {
	}

	export namespace PromotionService {
	}

	export class RadioButton extends PackageCore.Component {
		constructor(options?: Self.RadioButton.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | null);

		/**
		 * @deprecated
		 */
		radio: Self.RadioButton;

		labelPosition: Self.RadioButton.LabelPosition;

		value: (boolean | null);

		clickableLabel: boolean;

		readOnly: boolean;

		emptyLabel: boolean;

		group: (Self.RadioGroup | null);

		action: (Self.RadioButton.ActionCallback | null);

		data: any;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		setValue(value: (boolean | null), options?: {reason?: string}): void;

		setLabel(label: string): void;

		setLabelPosition(value: Self.RadioButton.LabelPosition): void;

		setGroup(group: Self.RadioGroup): void;

		static Event: Self.RadioButton.EventTypes;

	}

	export namespace RadioButton {
		interface Options extends PackageCore.Component.Options {
			clickableLabel?: boolean;

			group?: Self.RadioGroup;

			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			labelPosition?: Self.RadioButton.LabelPosition;

			value?: boolean;

			action?: Self.RadioButton.ActionCallback;

			data?: any;

			readOnly?: boolean;

		}

		type ActionCallback = (args: Self.RadioButton.ActionArgs, sender: Self.RadioButton) => void;

		interface ActionArgs {
			value: boolean;

			previousValue: boolean;

			reason: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

		}

		enum VisualStyle {
			DEFAULT,
		}

		enum LabelPosition {
			LEFT,
			RIGHT,
			ABOVE,
			BELOW,
		}

		enum Reason {
			CLICK,
			KEY_PRESS,
		}

		export import Group = Self.RadioButtonGroup;

	}

	export class RadioButtonGroup extends PackageCore.Component {
		constructor(options?: Self.RadioButtonGroup.Options);

		children: PackageCore.VDom.Children;

		selectedData: any;

		columnGap: Self.RadioButtonGroup.GapSize;

		rowGap: Self.RadioButtonGroup.GapSize;

		columns: (number | string | globalThis.Array<string>);

		rows: (number | string | globalThis.Array<string>);

		gridOptions: Self.GridPanel.Options;

		onSelectionChanged: (Self.RadioButtonGroup.SelectionChangedCallback | null);

		private renderChild(child: PackageCore.JSX.Element): PackageCore.JSX.Element;

		private removeFromGroup(ref: PackageCore.VDom.Ref): void;

		private handleToggled(value: boolean, data: any, reason: (string | symbol)): void;

		private handleSelectedItemChanged(previousData: any, data: any, reason: (string | symbol)): void;

		static Event: Self.RadioButtonGroup.EventTypes;

		static Horizontal(props: Self.RadioButtonGroup.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.RadioButtonGroup.Options): PackageCore.JSX.Element;

	}

	export namespace RadioButtonGroup {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			columns?: (number | string | globalThis.Array<string>);

			rows?: (number | string | globalThis.Array<string>);

			columnGap?: (number | string | globalThis.Array<string>);

			rowGap?: (number | string | globalThis.Array<string>);

			gridOptions?: Self.GridPanel.Options;

			defaultItemOptions?: Self.RadioButton.Options;

			onSelectionChanged?: Self.RadioButtonGroup.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.RadioButtonGroup.SelectionChangedArgs, sender: Self.RadioButtonGroup) => void;

		interface SelectionChangedArgs {
			data: any;

			previousData: any;

			reason: (string | symbol);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_ITEM_CHANGED: string;

		}

		export import GapSize = Self.GapSize;

	}

	export class RadioGroup implements PackageCore.EventSource {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options?: Self.RadioGroup.Options);

		guid: string;

		buttons: globalThis.Array<Self.RadioButton>;

		selectedButton: (Self.RadioButton | null);

		add(button: Self.RadioButton): Self.RadioGroup;

		remove(button: Self.RadioButton): void;

		focusNext(button: Self.RadioButton, direction: number): boolean;

		static Event: Self.RadioGroup.EventTypes;

	}

	export namespace RadioGroup {
		interface Options {
			tabbable?: boolean;

			onToggled?: Self.RadioGroup.ToggledCallback;

			on?: PackageCore.EventSource.ListenerMap;

		}

		type ToggledCallback = (args: Self.RadioGroup.ToggledArgs, sender: Self.RadioGroup) => void;

		interface ToggledArgs {
			button: Self.RadioButton;

			previousButton: Self.RadioButton;

			value: boolean;

			previousValue: boolean;

			data: any;

			reason: any;

		}

		interface EventTypes {
			BUTTON_REMOVED: string;

			BUTTON_ADDED: string;

			BUTTON_TOGGLED: string;

		}

		enum Reason {
			RADIO_GROUP_DESELECT,
		}

	}

	export class RadioGroupPicker extends Self.Picker {
		constructor(options: Self.RadioGroupPicker.Options);

		dataSource: PackageCore.DataSource;

		radioGroup: Self.RadioGroup;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		valueMember: (Self.DataSourceComponent.ValueMember | null);

		private handleSelectionChanged(item: any, args: Self.RadioButton.ActionArgs): void;

		private forwardMessageToGroup(message: PackageCore.RoutedMessage, result: object): void;

		private selectFirst(topOrBottom: number): void;

		private getDisplayMember(dataItem: object): any;

		private updateContent(selection: any, searchPhrase?: string): void;

		private createPlaceholder(): void;

		private createRadioButton(group: Self.RadioGroup, item: any, value: boolean): void;

		private applySelection(selection: any): void;

	}

	export namespace RadioGroupPicker {
		interface Options extends Self.Picker.Options {
			dataSource: PackageCore.DataSource;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			valueMember?: Self.DataSourceComponent.ValueMember;

			comparator?: (left: any, right: any) => boolean;

			searchMember?: Self.DataSourceComponent.DisplayMember;

			noDataMessage?: (string | PackageCore.Translation);

		}

	}

	export class RadioList {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		onPropertyChanged(propertyName?: string, callback?: (args: PackageCore.PropertyObservable.EventArgs, sender: any) => void): any;

		protected _notifyPropertyChanged(propertyName: string, oldValue: any, newValue: any, reason?: (string | null)): void;

		constructor(options: object);

		data: globalThis.Array<any>;

		radios: globalThis.Array<Self.RadioButton>;

		group: Self.RadioGroup;

		selectedValue: any;

		selectedItem: any;

		selectedRadio: Self.RadioButton;

		attachRadiosTo(element: HTMLElement): void;

		setSelectedValue(value: any): void;

		itemForValue(value: any): (any | null);

		radioForValue(value: any): (Self.RadioButton | null);

		static Event: Self.RadioList.EventTypes;

	}

	export namespace RadioList {
		interface EventTypes {
			TOGGLED: string;

		}

	}

	export class Ratings extends PackageCore.Component {
		constructor(options?: Self.Ratings.Options);

		rating: number;

		imageSize: Self.Ratings.ImageSize;

		imageVariant: Self.Ratings.ImageVariant;

		mode: Self.Ratings.Mode;

		quantity: Self.Ratings.Quantity;

		tooltips: globalThis.Array<(PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | null)>;

		readOnly: boolean;

		color: Self.Ratings.Color;

		onRatingChanged: (Self.Ratings.RatingChangedCallback | null);

		setRating(value: number, args?: {reason?: (string | symbol)}): void;

		setColor(color: Self.Ratings.Color): void;

		setReadOnly(readOnly: boolean): void;

		private _createIconPairs(quantity: Self.Ratings.Quantity, imageVariant: Self.Ratings.ImageVariant, tooltips: globalThis.Array<(PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | null)>): globalThis.Array<Self.Ratings.IconPair>;

		private _createRawIconPairs(quantity: Self.Ratings.Quantity, imageVariant: Self.Ratings.ImageVariant): globalThis.Array<Self.Ratings.IconPair>;

		private _createImage(index: number, icons: Self.Ratings.IconPair): PackageCore.JSX.Element;

		static Event: Self.Ratings.EventTypes;

	}

	export namespace Ratings {
		interface Options extends PackageCore.Component.Options {
			color?: Self.Ratings.Color;

			imageSize?: Self.Ratings.ImageSize;

			imageVariant?: Self.Ratings.ImageVariant;

			mode?: Self.Ratings.Mode;

			quantity?: Self.Ratings.Quantity;

			rating?: number;

			defaultRating?: number;

			readOnly?: boolean;

			tooltips?: globalThis.Array<(PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | null)>;

			onRatingChanged?: Self.Ratings.RatingChangedCallback;

		}

		type RatingChangedCallback = (args: Self.Ratings.RatingChangedArgs, sender: Self.Ratings) => void;

		interface RatingChangedArgs {
			value: number;

			previousValue: number;

			reason: Self.Ratings.Reason;

		}

		interface IconPair {
			filled: PackageCore.ImageMetadata;

			outline: PackageCore.ImageMetadata;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			RATING_CHANGED: string;

		}

		enum Quantity {
			THREE,
			FOUR,
			FIVE,
		}

		enum Mode {
			FULL,
			SINGLE,
		}

		enum ImageVariant {
			STAR,
			HEART,
			FACE,
			NUMBER,
		}

		enum ImageSize {
			M,
			L,
			XL,
		}

		enum Color {
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			ACCENT,
			ERROR,
			DEFAULT,
		}

		enum I18n {
			POOR,
			OKAY,
			GOOD,
			GREAT,
			EXCELLENT,
		}

		enum Reason {
			KEY,
			CLICK,
			CALL,
		}

	}

	export class RecordInfoPortlet extends PackageCore.Component {
		constructor(options?: Self.RecordInfoPortlet.Options);

	}

	export namespace RecordInfoPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class Reminder extends PackageCore.Component {
		constructor(options?: Self.Reminder.Options);

		color: Self.Reminder.Color;

		count: (string | number | PackageCore.Translation | null);

		description: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		layout: Self.Reminder.Layout;

	}

	export namespace Reminder {
		interface Options extends PackageCore.Component.Options {
			color?: Self.Reminder.Color;

			description: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			count?: (string | number | PackageCore.Translation | null);

			layout?: Self.Reminder.Layout;

		}

		enum Layout {
			HEADLINE,
			INLINE,
		}

		enum Color {
			NEUTRAL,
			SUCCESS,
			WARNING,
			DANGER,
			INFO,
			TEAL,
			ORANGE,
			TURQUOISE,
			TAUPE,
			GREEN,
			PINK,
			BROWN,
			LILAC,
			YELLOW,
			PURPLE,
			BLUE,
			PINE,
			THEMED,
		}

	}

	export class ReminderPortlet extends PackageCore.Component {
		constructor(options?: Self.ReminderPortlet.Options);

	}

	export namespace ReminderPortlet {
		interface Options extends PackageCore.Component.Options {
		}

	}

	export class ResponsivePanel extends PackageCore.Component {
		constructor(options: Self.ResponsivePanel.Options);

		content: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<Self.ResponsivePanel.ItemObject> | null);

		children: PackageCore.VDom.Children;

		widthBreakpoint: (Self.ResponsivePanel.BreakpointKey | null);

		widthBreakpoints: Record<Self.ResponsivePanel.BreakpointKey, number>;

		heightBreakpoint: (Self.ResponsivePanel.BreakpointKey | null);

		heightBreakpoints: Record<Self.ResponsivePanel.BreakpointKey, number>;

		private parseChildren(children: PackageCore.VDom.Children): globalThis.Array<PackageCore.JSX.Element>;

		private parseContent(content: (PackageCore.JSX.Element | PackageCore.Component | globalThis.Array<Self.ResponsivePanel.ItemObject>)): globalThis.Array<PackageCore.JSX.Element>;

		private parseBreakpoints(breakpoints: Record<Self.ResponsivePanel.BreakpointKey, number>): globalThis.Map<Self.ResponsivePanel.BreakpointKey, number>;

		private getBreakpoint(size: number, breakpoints: Self.ResponsivePanel.BreakpointKey): (Self.ResponsivePanel.BreakpointKey | null);

		private updateWidthBreakpoint(): void;

		private updateHeightBreakpoint(): void;

		private renderItem(): PackageCore.JSX.Element;

		static WidthBreakpointContext: string;

		static HeightBreakpointContext: string;

		static Event: Self.ResponsivePanel.EventTypes;

		static Item(props?: {children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	}

	export namespace ResponsivePanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (PackageCore.Component | PackageCore.JSX.Element);

			widthBreakpoints?: Record<string, number>;

			heightBreakpoints?: Record<string, number>;

		}

		type BreakpointKey = string;

		interface ItemObject {
			component: (PackageCore.Component | PackageCore.JSX.Element);

			minWidth: Self.ResponsivePanel.BreakpointKey;

			maxWidth: Self.ResponsivePanel.BreakpointKey;

			width: Self.ResponsivePanel.BreakpointKey;

			minHeight: Self.ResponsivePanel.BreakpointKey;

			maxHeight: Self.ResponsivePanel.BreakpointKey;

			height: Self.ResponsivePanel.BreakpointKey;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			WIDTH_BREAKPOINT_CHANGED: string;

			HEIGHT_BREAKPOINT_CHANGED: string;

		}

		enum Breakpoint {
			XXL,
			XL,
			LG,
			MD,
			SM,
			XS,
		}

		enum BootstrapBreakpoint {
			XXL,
			XL,
			LG,
			MD,
			SM,
			XS,
		}

		enum BootstrapBreakpoints {
		}

	}

	export class RichTextEditor extends PackageCore.Component {
		constructor(options: Self.RichTextEditor.Options);

		text: string;

		empty: boolean;

		placeholder: string;

		maxLength: number;

		maxLengthIndicator: boolean;

		resizable: boolean;

		editorMode: Self.RichTextEditor.EditorMode;

		onTextChanged: (Self.RichTextEditor.TextChangedCallback | null);

		bloom: boolean;

		setText(text: string, options?: object): void;

		setMaxLength(maxLength: number): void;

		setMaxLengthIndicator(value: boolean): void;

		setEditorMode(editorMode: Self.RichTextEditor.EditorMode): void;

		static Event: Self.RichTextEditor.EventTypes;

	}

	export namespace RichTextEditor {
		interface Options extends PackageCore.Component.Options {
			text?: string;

			maxLength?: (number | null);

			maxLengthIndicator?: boolean;

			placeholder?: (string | PackageCore.Translation);

			allowChangeEditorMode?: boolean;

			editorMode?: EditorMode;

			resizable?: boolean;

			resizeDirection?: Self.RichTextEditor.ResizeDirection;

			defaultFontFamily?: string;

			defaultFontSize?: number;

			onTextChanged?: Self.RichTextEditor.TextChangedCallback;

			bloom?: boolean;

		}

		type TextChangedCallback = (args: Self.RichTextEditor.TextChangedArgs, sender: Self.RichTextEditor) => void;

		interface TextChangedArgs {
			text: string;

			previousText: string;

			reason: Self.RichTextEditor.TextChangeReason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TEXT_CHANGED: string;

			EDITOR_RESIZED: string;

			SELECTION_CHANGED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
		}

		enum ResizeDirection {
			BOTH,
			HORIZONTAL,
			VERTICAL,
		}

		enum FontFamily {
			ARIAL,
			COMIC_SANS,
			GEORGIA,
			GOTHIC,
			MYRIAD,
			OPEN_SANS,
			TAHOMA,
			TIMES_NEW_ROMAN,
			TREBUCHET,
			VERDANA,
		}

		enum EditorMode {
			SOURCE,
			WYSIWYG,
		}

		enum TextChangeReason {
			INPUT,
		}

	}

	class RowResizer implements PackageCore.MessageHandler {
		constructor();

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	namespace RowResizer {
	}

	class ScrollButton extends PackageCore.Component {
		constructor(options: Self.ScrollButton.Options);

	}

	namespace ScrollButton {
		interface Options extends PackageCore.Component.Options {
			buttonOptions: Self.Button.Options;

			background: boolean;

		}

	}

	export function ScrollLayout(props?: {topContent?: (PackageCore.Component | PackageCore.JSX.Element | null); children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	export class ScrollPanel extends PackageCore.Component {
		constructor(options: Self.ScrollPanel.Options);

		scrollController: PackageCore.ScrollController;

		scrollOffset: PackageCore.Scrollable.Offset;

		viewportSize: PackageCore.Scrollable.Size;

		contentSize: PackageCore.Scrollable.Size;

		orientation: Self.ScrollPanel.Orientation;

		content: (PackageCore.Component | PackageCore.JSX.Element | null);

		children: PackageCore.VDom.Children;

		element: Self.ScrollPanel.Element;

		scrollControl: Self.ScrollPanel.ScrollControl;

		scrollControlPosition: Self.ScrollPanel.ScrollControlPosition;

		scrollAmount: number;

		hoverScrollAmount: number;

		hoverScrollRepeat: number;

		hoverScrolls: boolean;

		autoHideButtons: Self.ScrollPanel.AutoHide;

		decorator: (PackageCore.Decorator | null);

		setContent(content: PackageCore.Component): void;

		setOrientation(orientation: Self.ScrollPanel.Orientation): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		scrollIntoView(args: {element: Element; reason?: string}): void;

		scroll(): boolean;

		scrollToTop(options?: {reason?: any}): boolean;

		scrollToBottom(options?: {reason?: any}): boolean;

		private _createScrollButtons(): void;

		static horizontal(options?: Self.ScrollPanel.Options): Self.ScrollPanel;

		static Horizontal(): PackageCore.JSX.Element;

		static vertical(options?: Self.ScrollPanel.Options): Self.ScrollPanel;

		static Vertical(): PackageCore.JSX.Element;

	}

	export namespace ScrollPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			allowWheelPassThrough?: boolean;

			content?: (PackageCore.Component | PackageCore.JSX.Element);

			decorator?: PackageCore.Decorator;

			hoverScrolls?: boolean;

			autoHideButtons?: Self.ScrollPanel.AutoHide;

			orientation?: Self.ScrollPanel.Orientation;

			scrollControlPosition?: Self.ScrollPanel.ScrollControlPosition;

			scrollControl?: Self.ScrollPanel.ScrollControl;

			scrollAmount?: number;

			hoverScrollAmount?: number;

			hoverScrollRepeat?: number;

			element?: Self.ScrollPanel.Element;

			onScrollabilityChanged?: Self.ScrollPanel.ScrollabilityChangedCallback;

		}

		type ScrollabilityChangedCallback = (args: Self.ScrollPanel.ScrollabilityChangedCallbackArgs) => void;

		interface ScrollabilityChangedCallbackArgs {
			value: PackageCore.Scrollable.Scrollability;

			previousValue: PackageCore.Scrollable.Scrollability;

			reason: any;

		}

		enum ScrollControl {
			BAR,
			BUTTON,
		}

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
			BOTH,
		}

		enum ScrollControlPosition {
			SIDE_CONTENT,
			OVER_CONTENT,
		}

		enum AutoHide {
			NONE,
			OWN_SCROLLABLE,
			AXIS_SCROLLABLE,
			ANY_SCROLLABLE,
		}

		export import Element = PackageCore.Html.Element.Section;

	}

	export class ScrollTabList extends PackageCore.Component {
		constructor(options?: Self.ScrollTabList.Options);

		tabs: globalThis.Array<Self.Tab>;

		children: PackageCore.VDom.Children;

		reorder: boolean;

		justification: Self.ScrollTabList.Justification;

		tabSpacer: (boolean | null);

		position: Self.ScrollTabList.Position;

		stripePosition: Self.ScrollTabList.StripePosition;

		horizontal: boolean;

		hierarchy: Self.ScrollTabList.Hierarchy;

		divider: boolean;

		selectedValue: Self.Tab;

		decorator: (PackageCore.Decorator | null);

		tabIndex(tab: Self.Tab): (number | null);

		setPosition(position: Self.ScrollTabList.Position): void;

		setStripePosition(position: Self.ScrollTabList.StripePosition): void;

		setHierarchy(hierarchy: Self.ScrollTabList.Hierarchy): void;

		setJustification(justification: Self.ScrollTabList.Justification): void;

		setTabSpacer(value: (boolean | null)): void;

		move(item: Self.Tab, options?: {index: number; reason?: string}): void;

	}

	export namespace ScrollTabList {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			position?: Self.ScrollTabList.Position;

			stripePosition?: Self.ScrollTabList.StripePosition;

			justification?: Self.ScrollTabList.Justification;

			hierarchy?: Self.ScrollTabList.Hierarchy;

			divider?: boolean;

			reorder?: boolean;

			tabSpacer?: boolean;

			decorator?: PackageCore.Decorator;

			items?: globalThis.Array<Self.Tab>;

		}

		export import VisualStyle = Self.TabPanelOptions.VisualStyle;

		export import Position = Self.TabPanelOptions.TabPosition;

		export import StripePosition = Self.TabPanelOptions.TabStripePosition;

		export import Justification = Self.TabPanelOptions.TabJustification;

		export import Hierarchy = Self.TabPanelOptions.Hierarchy;

	}

	export class Scrollbar extends PackageCore.Component {
		constructor();

		scrollController: PackageCore.ScrollController;

		trackSize: number;

		contentSize: PackageCore.Scrollable.Size;

		viewportSize: PackageCore.Scrollable.Size;

		scrollOffset: number;

		maxScrollOffset: number;

		autoHide: boolean;

		isActive: boolean;

		nextPage(args: object): void;

		previousPage(args: object): void;

	}

	export namespace Scrollbar {
		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

		enum VisualStyle {
			DOCKED,
		}

	}

	export class ScrollbarDragListener {
		constructor();

		attach(): void;

		detach(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	export namespace ScrollbarDragListener {
	}

	export class SearchItem extends PackageCore.Component {
		constructor(options?: Self.SearchItem.Options);

		activeLink: Self.Link;

		handleKeyPress(): boolean;

		static getRefreshedStyles(theme: PackageCore.RefreshedTheme): void;

		static getRedwoodStyles(theme: PackageCore.RedwoodTheme): void;

	}

	export namespace SearchItem {
		interface Options extends PackageCore.Component.Options {
			link?: Self.SearchItem.LinkItem;

			sublinks?: globalThis.Array<Self.SearchItem.LinkItem>;

			type?: string;

		}

		interface LinkItem {
			description?: string;

			name?: string;

			url?: string;

		}

	}

	enum SearchItemCategory {
		BUTTON,
		COLUMN,
		FIELD,
		FIELD_GROUP,
		LINK,
		MENU,
		SUB_TAB,
		TAB,
		SUBLIST,
	}

	enum SearchItemType {
		ACTION,
		HEADER,
		RESULT,
		MORE,
		FEWER,
		BACK,
		LOADER,
		NO_RESULT,
	}

	export class SelectionCell extends Self.GridCell {
		constructor(options?: object);

		selectable: boolean;

		widgetOptions: (Self.CheckBox.Options | Self.GridCell.WidgetOptionsCallback<Self.CheckBox.Options>);

		singleSelect: boolean;

		setSelectable(value: boolean): void;

	}

	export namespace SelectionCell {
	}

	export class SelectionColumn extends Self.GridColumn {
		constructor(options: Self.SelectionColumn.Options);

		singleSelect: boolean;

		radioGroup: Self.RadioGroup;

		strategy: Self.GridSelectionStrategy;

		selection: Self.GridSelection;

		widgetOptions: (Self.CheckBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.CheckBox.Options> | null);

		setSelection(selection: Self.GridSelection, options?: {forceUpdate?: boolean; reason?: string}): void;

		clearSelection(options?: {reason?: string}): void;

		selectRow(row: Self.GridRow, value: boolean): void;

		selectItem(item: any, value: boolean, options?: {reason?: string}): void;

		selectMulti(mode: Self.GridSelection.Mode, value: boolean, options?: {reason?: string}): void;

		isRowSelected(row: Self.GridDataRow): (boolean | null);

		isRowSelectable(row: Self.GridDataRow): boolean;

		setIsSelectable(callback: (dataItem: any) => boolean): void;

		forceUpdate(): void;

		update(): void;

		static Event: Self.SelectionColumn.EventTypes;

	}

	export namespace SelectionColumn {
		interface Options extends Self.GridColumn.Options {
			singleSelect?: boolean;

			selection?: Self.GridSelection;

			isSelectable?: Self.SelectionColumn.IsSelectableCallback;

			widgetOptions?: (Self.CheckBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.CheckBox.Options>);

			strategy?: Self.GridSelectionStrategy;

			withSelectAll?: boolean;

		}

		type IsSelectableCallback = (dataItem: any) => boolean;

		interface EventTypes extends Self.GridColumn.EventTypes {
			SELECTION_CHANGED: string;

		}

		export import Mode = Self.GridSelection.Mode;

		export import Cell = Self.SelectionCell;

	}

	export class Shell {
		constructor(options?: Self.Shell.Options);

		private layout: Self.Shell.LayoutType;

		theme: PackageCore.Theme;

		supportedThemes: globalThis.Array<PackageCore.Theme.Name>;

		systemHeader: (PackageCore.Component | null);

		applicationHeader: (PackageCore.Component | PackageCore.Presenter | null);

		content: (PackageCore.Presenter | PackageCore.Component | PackageCore.JSX.Element | null);

		topContent: (PackageCore.Component | PackageCore.JSX.Element | null);

		setContent(content: (PackageCore.Presenter | PackageCore.Component | null)): void;

		setTopContent(topContent: (PackageCore.Component | PackageCore.JSX.Element | null)): void;

		setTheme(theme: PackageCore.Theme): void;

		private render(): void;

		run(): void;

		dispose(): void;

	}

	export namespace Shell {
		interface Options {
			host: Self.Host;

			applicationHeader?: (PackageCore.Presenter | PackageCore.Component);

			topCcontent?: (PackageCore.Component | PackageCore.JSX.Element | null);

			content?: (PackageCore.Presenter | PackageCore.Component | PackageCore.JSX.Element);

			router?: PackageCore.Router;

			systemHeader?: PackageCore.Component;

			layout?: Self.Shell.LayoutType;

			supportedThemes?: globalThis.Array<PackageCore.Theme.Name>;

		}

		export import Layout = Self.ShellLayout;

		enum LayoutType {
			NATURAL,
			APPLICATION,
		}

	}

	function ShellLayout(props?: {systemHeader?: (PackageCore.Component | PackageCore.JSX.Element); applicationHeader?: (PackageCore.Component | PackageCore.JSX.Element); topContent?: (PackageCore.VDom.Element | Comment | null); children?: (PackageCore.Component | PackageCore.JSX.Element); appLayout?: boolean}): PackageCore.JSX.Element;

	export class ShuttleUI extends PackageCore.Component {
		constructor(options?: Self.ShuttleUI.Options);

		sourceLabel: string;

		sourceSearch: boolean;

		sourceViewSelected: boolean;

		sourceDataSource: PackageCore.DataSource;

		sourceList: Self.ListBox;

		sourceFilters: (object | null);

		sourceSegments: (object | PackageCore.ArrayDataSource | globalThis.Array<any> | null);

		sourceLoading: boolean;

		sourceSelectedItems: globalThis.Array<any>;

		targetLabel: string;

		targetSearch: boolean;

		targetViewSelected: boolean;

		targetDataSource: PackageCore.DataSource;

		targetList: Self.ListBox;

		targetFilters: (object | null);

		targetSegments: (object | PackageCore.ArrayDataSource | globalThis.Array<any> | null);

		targetLoading: boolean;

		targetSelectedItems: globalThis.Array<any>;

		maxSelection: number;

		dragAndDrop: boolean;

		filters: globalThis.Array<any>;

		segment: globalThis.Array<any>;

		setSourceList(newData?: PackageCore.DataSource, options?: object): void;

		setTargetList(newData?: PackageCore.DataSource, options?: object): void;

		addSelectedItemsToTarget(): void;

		removeSelectedItemsFromTarget(): void;

		addItemToTarget(item: object): void;

		removeItemFromTarget(item: object): void;

		filterSourceList(): void;

		filterTargetList(): void;

		filterLists(): void;

		sourceIsDataGrid(): boolean;

		targetIsDataGrid(): boolean;

		static Event: Self.ShuttleUI.EventTypes;

	}

	export namespace ShuttleUI {
		interface Options extends PackageCore.Component.Options {
			disableFilters?: boolean;

			disableFiltersAndSegments?: boolean;

			disableSegments?: boolean;

			dragAndDrop?: boolean;

			layout?: Self.ShuttleUI.Layout;

			maxSelection?: (number | boolean);

			sourceDataSource?: (PackageCore.DataSource | null);

			sourceDisplayMember?: string;

			sourceFilters?: (object | null);

			sourceLabel?: string;

			sourceSearch?: boolean;

			sourceSegments?: (PackageCore.ArrayDataSource | globalThis.Array<any> | null);

			sourceShowSelectedOnlyCheckbox?: boolean;

			sourceValueMember?: string;

			targetDataSource?: (PackageCore.DataSource | null);

			targetDisplayMember?: string;

			targetFilters?: (object | null);

			targetLabel?: string;

			targetSearch?: boolean;

			targetSegments?: (PackageCore.ArrayDataSource | globalThis.Array<any> | null);

			targetShowSelectedOnlyCheckbox?: boolean;

			targetValueMember?: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTION_CHANGED: string;

			SEARCH_CHANGED: string;

			FILTERS_CHANGED: string;

			SEGMENT_CHANGED: string;

		}

		enum I18N {
			TYPE_TO_FILTER,
			NO_ITEMS_TO_SELECT,
			NO_SELECTIONS_MADE,
			BUTTON_ADD_TO_TARGET,
			BUTTON_REMOVE_FROM_TARGET,
			SEGMENTS,
			FILTER,
		}

		enum List {
			SOURCE,
			TARGET,
		}

		enum VisualStyle {
			DEFAULT,
			STANDALONE,
		}

		enum Layout {
			DEFAULT,
			EQUAL_LISTS,
		}

		enum Reason {
			CALL,
		}

	}

	export class ShuttleUIPicker extends Self.Picker {
		constructor(options?: Self.ShuttleUIPicker.Options);

		dataSource: PackageCore.DataSource;

		filter: (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		private _handleSelectionChanged(args: {addedItems: globalThis.Array<any>; removedItems: globalThis.Array<any>}, reason: string): void;

		private _forwardKeyDownToShuttle(): void;

	}

	export namespace ShuttleUIPicker {
		interface Options extends Self.Picker.Options {
			dataSource: PackageCore.DataSource;

			filter: (dataSource: PackageCore.DataSource, text: string) => PackageCore.DataSource;

		}

		export import Reason = Self.Picker.Reason;

	}

	export class Skeleton extends PackageCore.Component {
		constructor(options?: Self.Skeleton.Options);

		animation: boolean;

		width: (number | string);

		height: (number | string);

		icon: (Self.Image.Source | null);

		borderRadius: (number | string);

		static rectangle(options?: {width?: (number | string); height?: (number | string)}, settings?: Self.Skeleton.Options): Self.Skeleton;

		static Rectangle(options?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static square(options?: {size?: (number | string)}, settings?: Self.Skeleton.Options): Self.Skeleton;

		static Square(options?: Self.Skeleton.Options & {size?: (number | string)}): PackageCore.JSX.Element;

		static ellipse(options?: {width?: (number | string); height?: (number | string)}, settings?: Self.Skeleton.Options): Self.Skeleton;

		static Ellipse(options?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static circle(options?: {diameter?: (number | string)}, settings?: Self.Skeleton.Options): Self.Skeleton;

		static Circle(options?: Self.Skeleton.Options & {diameter?: (number | string)}): PackageCore.JSX.Element;

		static line(options?: {width?: (number | string); height?: number}, settings?: Self.Skeleton.Options): Self.Skeleton;

		static Line(options?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static lines(options?: {count?: number}, settings?: PackageCore.Component.Options): PackageCore.Component;

		static Lines(options: PackageCore.Component.Options & {count?: number}): PackageCore.JSX.Element;

		static text(options: {count: number}, settings?: PackageCore.Component.Options): PackageCore.Component;

		static Text(props: PackageCore.Component.Options & {count?: number}): PackageCore.JSX.Element;

		static divider(settings?: Self.Skeleton.Options): Self.Skeleton;

		static Divider(props?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static chart(settings?: Self.Skeleton.Options): Self.Skeleton;

		static Chart(props?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static chartBar(settings?: Self.Skeleton.Options): Self.Skeleton;

		static ChartBar(props?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static chartLine(settings?: Self.Skeleton.Options): Self.Skeleton;

		static ChartLine(props?: Self.Skeleton.Options): PackageCore.JSX.Element;

		static table(options?: {rows?: number; columns?: number}, settings?: PackageCore.Component.Options): PackageCore.Component;

		static Table(props?: PackageCore.Component.Options & {rows?: number; columns?: number}): PackageCore.JSX.Element;

		static kpi(options?: Self.ContentPanel.Options): PackageCore.Component;

		static Kpi(props?: PackageCore.Component.Options): PackageCore.JSX.Element;

		static reminder(options?: Self.GridPanel.Options): PackageCore.Component;

		static Reminder(props?: PackageCore.Component.Options): PackageCore.JSX.Element;

		static reminders(options: {count?: number}, settings?: PackageCore.Component.Options): PackageCore.Component;

		static Reminders(props?: PackageCore.Component.Options & {count?: number}): PackageCore.JSX.Element;

		static field(): PackageCore.Component;

		static Field(props?: PackageCore.Component.Options): PackageCore.JSX.Element;

		static fieldGroup(options: {content: PackageCore.Component}): PackageCore.Component;

		static FieldGroup(props?: PackageCore.Component.Options & {children?: any}): PackageCore.JSX.Element;

		static grid(options: {rows: number; columns: number; borderRadius?: (number | string)}, settings: PackageCore.Component.Options): PackageCore.Component;

		static Grid(props: PackageCore.Component.Options & {rows: number; columns: number}): PackageCore.JSX.Element;

		static applicationHeader(options?: {icon?: boolean; subtitle?: boolean; actions?: number}): PackageCore.Component;

		static ApplicationHeader(props?: PackageCore.Component.Options & {icon?: boolean; subtitle?: boolean; actions?: number}): PackageCore.JSX.Element;

	}

	export namespace Skeleton {
		interface Options extends PackageCore.Component.Options {
			animation?: boolean;

			borderRadius?: (number | string);

			height?: (number | string);

			icon?: Self.Image.Source;

			width?: (number | string);

		}

	}

	export class Slider extends PackageCore.Component {
		constructor(options?: Self.Slider.Options);

		selectedItem: (string | number | PackageCore.Translation | Self.Slider.Item);

		bigStep: (number | null);

		editable: boolean;

		readOnly: boolean;

		trackColor: string;

		trackBackgroundCheckerboard: boolean;

		onSelectionChanged: (Self.Slider.SelectionChangedCallback | null);

		selectItem(item: (Self.Slider.Item | string | number | PackageCore.Translation), reason?: string): void;

		selectFirstItem(options?: {reason?: symbol}): void;

		selectNextItem(options?: {reason?: symbol}): void;

		selectPreviousItem(options?: {reason?: symbol}): void;

		selectNextItemWithBigStep(options?: {reason?: symbol}): void;

		selectPreviousItemWithBigStep(options?: object, reason?: symbol): void;

		selectLastItem(options?: {reason?: symbol}): void;

		selectItemOnIndex(index: number, options?: {reason?: symbol}): void;

		selectItemByDistance(distance: number, options?: {reason?: symbol}): void;

		setTrackColor(value: string): void;

		setTrackBackgroundCheckerboard(value: boolean): void;

		private _handleSelectedItemChanged(handle: Self.SliderRange.Handle, item: Self.Slider.Item, previousItem: Self.Slider.Item, reason: (symbol | string)): void;

		private _handleHandleMoved(handle: Self.SliderRange.Handle, position: number, data: Self.SliderRange.HandleData, reason: (symbol | string)): void;

		static Event: Self.Slider.EventTypes;

	}

	export namespace Slider {
		interface Item extends Self.SliderRange.Item {
		}

		interface HandleData extends Self.SliderRange.HandleData {
		}

		interface ValuesObject extends Self.SliderRange.ValuesObject {
		}

		interface Options extends PackageCore.Component.Options {
			selectedItem?: (string | number | Self.Slider.Item);

			trackStart?: (number | string | Self.Slider.Item);

			items?: (object | globalThis.Array<any>);

			labelPosition?: Self.Slider.LabelPosition;

			firstLabelPosition?: Self.Slider.LabelPosition;

			lastLabelPosition?: Self.Slider.LabelPosition;

			firstLabelVisible?: boolean;

			lastLabelVisible?: boolean;

			handleLabelVisible?: boolean;

			edgeLabelAlignment?: Self.Slider.EdgeLabelAlignment;

			orientation?: Self.Slider.Orientation;

			handleDisplayMember?: Self.Slider.DisplayMember;

			labelDisplayMember?: Self.Slider.DisplayMember;

			showSnapLines?: boolean;

			stickyDragging?: boolean;

			trackColor?: (string | PackageCore.Color);

			trackBackgroundCheckerboard?: boolean;

			editable?: boolean;

			readOnly?: boolean;

			bigStep?: number;

			decimalPrecision?: number;

			autoValue?: boolean;

			onSelectionChanged?: Self.Slider.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.Slider.SelectionChangedArgs, sender: Self.Slider) => void;

		interface SelectionChangedArgs {
			item: Self.Slider.Item;

			previousItem: Self.Slider.Item;

			reason: (symbol | string);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_ITEM_CHANGED: string;

			HANDLE_MOVED: symbol;

		}

		export import Orientation = Self.SliderRange.Orientation;

		export import LabelPosition = Self.SliderRange.LabelPosition;

		export import EdgeLabelAlignment = Self.SliderRange.EdgeLabelAlignment;

		export import SelectedItemMember = Self.SliderRange.DisplayMember;

		export import DisplayMember = Self.SliderRange.DisplayMember;

		export import DefaultEndItem = Self.SliderRange.DefaultEndItem;

		enum Reason {
			ITEM_SELECTED,
			CALL,
		}

	}

	export class SliderRange extends PackageCore.Component {
		constructor(options?: Self.SliderRange.Options);

		selectedRange: Self.SliderRange.Range;

		selectedRangeStart: Self.SliderRange.Item;

		selectedRangeEnd: Self.SliderRange.Item;

		bigStep: (number | null);

		editable: boolean;

		readOnly: boolean;

		startHandleEnabled: boolean;

		endHandleEnabled: boolean;

		trackColor: string;

		trackBackgroundCheckerboard: boolean;

		onRangeChanged: (Self.SliderRange.RangeChangedCallback | null);

		selectRange(range: (globalThis.Array<Self.SliderRange.Item> | globalThis.Array<string> | globalThis.Array<number> | globalThis.Array<PackageCore.Translation>), options?: {reason?: symbol}): boolean;

		selectRangeItem(item: (Self.SliderRange.Item | string | number | PackageCore.Translation | null), handle: Self.SliderRange.Handle, options?: {reason?: symbol}): boolean;

		selectRangeStart(item: (Self.SliderRange.Item | string | number | PackageCore.Translation | null), options?: {reason?: symbol}): boolean;

		selectRangeEnd(item: (Self.SliderRange.Item | string | number | PackageCore.Translation | null), options?: {reason?: symbol}): boolean;

		selectFirstItem(handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectNextItem(handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectNextItemWithBigStep(handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectPreviousItem(handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectPreviousItemWithBigStep(handle: Self.SliderRange.Handle, options?: object, reason?: symbol): void;

		selectLastItem(handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectItemOnIndex(index: number, handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		selectItemByDistance(distance: number, handle: Self.SliderRange.Handle, options?: {reason?: symbol}): void;

		setTrackColor(value: (string | PackageCore.Color)): void;

		setTrackBackgroundCheckerboard(value: boolean): void;

		enableHandle(handle: Self.SliderRange.Handle, value: boolean): void;

		private _createGridFractions(labelCount: number): globalThis.Array<string>;

		private _createGridElement(items: globalThis.Array<PackageCore.JSX.Element>, gridFractions: globalThis.Array<string>): Self.GridPanel;

		private _createHandlesLabelsAsGridItems(gridFractionsCount: number): void;

		private _createTrackAsGridItem(gridFractionsCount: number): void;

		private _createItemsAsGridItems(gridFractionsCount: number): void;

		private _createEdgeLabelGridItem(label: PackageCore.Component, fractionsCount: number, position: Self.SliderRange.LabelPosition, edgeLabel: Self.SliderRange.EdgeLabel): void;

		private _createLabelGridItem(label: PackageCore.Component, index: number, fractionsCount: number): void;

		private _createLabelComponent(labelValue: (number | string | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.Component), firstOrLast?: Self.SliderRange.EdgeLabel, position?: Self.SliderRange.LabelPosition): PackageCore.Component;

		private _createHandleLabelContainer(handle: Self.SliderRange.Handle): PackageCore.Component;

		private _createMixedHandleLabelContainer(): PackageCore.JSX.Element;

		private _createHandleLabel(handle: (Self.SliderRange.Handle | null), mixed?: boolean): PackageCore.Component;

		private _parseItems(items: (Self.SliderRange.ValuesObject | globalThis.Array<string> | globalThis.Array<number> | globalThis.Array<object>)): globalThis.Array<Self.SliderRange.Item>;

		private _handleSelectedRangeChanged(previousRange: globalThis.Array<Self.SliderRange.Item>, range: globalThis.Array<Self.SliderRange.Item>, reason: (string | symbol)): void;

		private _handleSelectedItemChanged(handle: Self.SliderRange.Handle, previousItem: Self.SliderRange.Item, item: Self.SliderRange.Item, reason: (string | symbol)): void;

		private _handleHandleMoved(handle: Self.SliderRange.Handle, position: number, reason: (string | symbol)): void;

		private _handleClick(message: object, result: object): void;

		private _handleMove(message: object): void;

		private _handleRelease(): void;

		private _setMixedHandleLabelVisibility(): void;

		private _initLastMovedHandle(): void;

		private _getEdgeLabelMainAxisIndex(edgeLabel: Self.SliderRange.EdgeLabel, rowPosition: Self.SliderRange.LabelPosition, fractionsCount: number): number;

		private _getLabelCrossAxisIndex(labelPosition: Self.SliderRange.LabelPosition): number;

		private _getEdgeLabelMainAxisAlignment(edgeLabel: Self.SliderRange.EdgeLabel): Self.GridPanel.Justification;

		private _getEdgeLabelCrossAxisAlignment(position: Self.SliderRange.LabelPosition): Self.GridPanel.Alignment;

		private _getEdgeLabelMainAxisCellSpan(position: Self.SliderRange.LabelPosition): number;

		private _getHandleClosestItem(mousePosition: object): Self.SliderRange.Item;

		private _getClosestHandle(position: number): (Self.SliderRange.Handle | null);

		private _getMouseTrackPosition(message: object, isFrameworkMessage?: boolean): number;

		private _getBoundedMouseTrackPosition(handleInMotion: Self.SliderRange.Handle, oppositeHandleData: Self.SliderRange.HandleData, mousePosition: number): number;

		private _getItem(item: (string | number | PackageCore.Translation | Self.SliderRange.Item | null)): (Self.SliderRange.Item | null);

		private _getItemByDistance(handle: Self.SliderRange.Handle, distance?: number): Self.SliderRange.Item;

		private _getItemByIndex(handle: Self.SliderRange.Handle, index: number): Self.SliderRange.Item;

		private _getBoundedItemIndex(handle: Self.SliderRange.Handle, index: number): number;

		private _getLongestLabelLength(): void;

		private _getDefaultLabelPosition(): Self.SliderRange.LabelPosition;

		private _isHorizontal(): boolean;

		private _isHorizontalLtr(): boolean;

		private _isHorizontalRtl(): boolean;

		private _isVertical(): boolean;

		private _initDirection(): string;

		static Event: Self.SliderRange.EventTypes;

	}

	export namespace SliderRange {
		type Range = [Self.SliderRange.Item, Self.SliderRange.Item];

		interface Item {
			index: number;

			value: number;

			label: (string | number | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.Component);

			labelDisabled: boolean;

			position: number;

			ariaValueText: (string | number | PackageCore.Translation);

		}

		interface HandleData {
			element: HTMLElement;

			label: PackageCore.Component;

			item: Self.SliderRange.Item;

			closestItem: Self.SliderRange.Item;

			currentPosition: number;

			enabled: boolean;

		}

		interface ValuesObject {
			start: number;

			end: number;

			startRoot?: number;

			step?: number;

			labelStep?: number;

			labels?: (globalThis.Array<number> | globalThis.Array<string> | globalThis.Array<PackageCore.Translation> | globalThis.Array<PackageCore.ImageMetadata> | globalThis.Array<PackageCore.Component>);

			firstLabel?: (number | string | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.Component | null);

			lastLabel?: (number | string | PackageCore.Translation | PackageCore.ImageMetadata | PackageCore.Component | null);

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			selectedRange?: globalThis.Array<(string | number | Self.SliderRange.Item)>;

			items?: (Self.SliderRange.ValuesObject | globalThis.Array<any>);

			labelPosition?: Self.SliderRange.LabelPosition;

			firstLabelPosition?: Self.SliderRange.LabelPosition;

			lastLabelPosition?: Self.SliderRange.LabelPosition;

			firstLabelVisible?: boolean;

			lastLabelVisible?: boolean;

			handleLabelVisible?: boolean;

			edgeLabelAlignment?: Self.SliderRange.EdgeLabelAlignment;

			orientation?: Self.SliderRange.Orientation;

			handleDisplayMember?: Self.SliderRange.DisplayMember;

			labelDisplayMember?: Self.SliderRange.DisplayMember;

			startHandleEnabled?: boolean;

			endHandleEnabled?: boolean;

			startHandlePresent?: boolean;

			endHandlePresent?: boolean;

			showSnapLines?: boolean;

			stickyDragging?: boolean;

			trackColor?: (string | PackageCore.Color);

			trackBackgroundCheckerboard?: boolean;

			editable?: boolean;

			readOnly?: boolean;

			bigStep?: number;

			decimalPrecision?: number;

			autoValue?: boolean;

			onRangeChanged?: Self.SliderRange.RangeChangedCallback;

		}

		type RangeChangedCallback = (args: Self.SliderRange.RangeChangedArgs, sender: Self.SliderRange) => void;

		interface RangeChangedArgs {
			range: Self.SliderRange.Range;

			previousRange: Self.SliderRange.Range;

			reason: (string | symbol);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_ITEM_CHANGED: string;

			SELECTED_RANGE_CHANGED: string;

			HANDLE_MOVED: string;

		}

		export import Orientation = Self.SliderRangeEnums.Orientation;

		enum Handle {
			START,
			END,
		}

		enum LabelPosition {
			BOTTOM,
			TOP,
			TRACK_ALIGNED,
		}

		enum EdgeLabelAlignment {
			DEFAULT,
			TRACK_END,
		}

		enum EdgeLabel {
			FIRST,
			LAST,
		}

		enum DisplayMember {
			LABEL,
			VALUE,
		}

		enum DefaultEndItem {
			LAST,
			FIRST,
		}

		enum Reason {
			ITEM_SELECTED,
			CALL,
			HANDLE_MOVED,
		}

	}

	export class SliderRangeControlHandler implements PackageCore.MessageHandler {
		constructor(options?: object);

		attach(): void;

		detach(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	export namespace SliderRangeControlHandler {
	}

	export namespace SliderRangeEnums {
		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

	}

	class SliderRangeHandle extends PackageCore.Component {
		constructor(options?: Self.SliderRangeHandle.Options);

	}

	namespace SliderRangeHandle {
		interface Options extends PackageCore.Component.Options {
			description: string;

			pressed: boolean;

			readOnly: boolean;

		}

	}

	class SliderRangeTrack extends PackageCore.Component {
		constructor(options?: Self.SliderRangeTrack.Options);

		private _isHorizontalLtr(): boolean;

		private _isHorizontalRtl(): boolean;

		private _createSnaplineElements(): PackageCore.JSX.Element;

		private _createBaseElement(): PackageCore.JSX.Element;

		private _createFillElement(): PackageCore.JSX.Element;

	}

	namespace SliderRangeTrack {
		interface Options extends PackageCore.Component.Options {
			color: (PackageCore.Color | string);

			endHandle: Self.SliderRangeHandle;

			startHandle: Self.SliderRangeHandle;

			snapLinesCount: number;

			snapLinesVisible: boolean;

			orientation: Self.SliderRangeTrack.Orientation;

			checkerBoard: boolean;

		}

		export import Orientation = Self.SliderRangeEnums.Orientation;

	}

	export class SplitButton extends PackageCore.Component {
		constructor(options?: Self.SplitButton.Options);

		action: Self.Button.ActionCallback;

		label: (null | string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		hasLabel: boolean;

		icon: (PackageCore.ImageMetadata | null);

		hasIcon: boolean;

		iconPosition: Self.SplitButton.IconPosition;

		size: Self.SplitButton.Size;

		type: Self.SplitButton.Type;

		hierarchy: Self.SplitButton.Hierarchy;

		menuOpened: boolean;

		menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu.Options);

		openOnHover: boolean;

		toggled: boolean;

		setLabel(label: (null | string | number | PackageCore.Translation | PackageCore.Component)): void;

		setIcon(icon: (PackageCore.ImageMetadata | null)): void;

		setIconPosition(position: Self.SplitButton.IconPosition): void;

		setSize(size: Self.SplitButton.Size): void;

		setType(type: Self.SplitButton.Type): void;

		setHierarchy(hierarchy: Self.SplitButton.Hierarchy): void;

		setMenu(menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu.Options)): void;

		openMenu(args?: object): void;

		closeMenu(args?: object): void;

		click(): void;

		static Event: Self.SplitButton.EventTypes;

	}

	export namespace SplitButton {
		interface Options extends PackageCore.Component.Options {
			action?: Self.Button.ActionCallback;

			hierarchy?: Self.SplitButton.Hierarchy;

			icon?: Self.Image.Source;

			iconPosition?: Self.SplitButton.IconPosition;

			label?: (null | string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			menu: (globalThis.Array<Self.MenuItem.ItemDefinition> | Self.Menu.Options);

			size?: Self.SplitButton.Size;

			type?: Self.SplitButton.Type;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ACTION: string;

			MENU_OPENED: string;

			MENU_CLOSED: string;

		}

		export import Size = Self.Button.Size;

		export import IconPosition = Self.Button.IconPosition;

		export import Type = Self.Button.Type;

		export import Hierarchy = Self.Button.Hierarchy;

		export import VisualStyle = Self.Button.VisualStyle;

	}

	export class SplitPanel extends PackageCore.Component {
		constructor(options?: Self.SplitPanel.Options);

		items: globalThis.Array<Self.SplitPanelItem>;

		children: PackageCore.VDom.Children;

		components: globalThis.Array<PackageCore.Component>;

		orientation: Self.SplitPanel.Orientation;

		length: number;

		empty: boolean;

		decorator: (PackageCore.Decorator | null);

		add(component: Self.SplitPanel.ItemConfiguration): Self.SplitPanel;

		remove(component: (PackageCore.Component | number)): Self.SplitPanel;

		clear(): Self.SplitPanel;

		setOrientation(orientation: Self.SplitPanel.Orientation): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		itemForComponent(component: PackageCore.Component): Self.SplitPanelItem;

		indexForComponent(component: PackageCore.Component): (number | null);

		static Horizontal(props: Self.SplitPanel.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.SplitPanel.Options): PackageCore.JSX.Element;

		static Item(props?: Self.SplitPanel.JsxItemProps): PackageCore.JSX.Element;

		static Event: Self.SplitPanel.EventTypes;

	}

	export namespace SplitPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<Self.SplitPanel.ItemConfiguration>;

			orientation?: Self.SplitPanel.Orientation;

			decorator?: PackageCore.Decorator;

			element?: Self.SplitPanel.Element;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

			ITEM_RESIZE_STARTED: string;

			ITEM_RESIZE_FINISHED: string;

			ITEM_RESIZED: string;

		}

		interface BaseItemProps {
			value?: any;

			collapse?: Self.SplitPanel.ItemCollapse;

			handleStyle?: Self.SplitPanel.HandleStyle;

			maxSize?: (string | number);

			minSize?: (string | number);

			resizable?: boolean;

			size?: (Self.SplitPanelItem.SizeOptions | string | number);

		}

		interface ItemProps extends Self.SplitPanel.BaseItemProps {
		}

		interface JsxItemProps extends Self.SplitPanel.BaseItemProps {
			children?: PackageCore.VDom.Children;

			key?: any;

		}

		interface StructuredItemConfiguration {
			component: PackageCore.Component;

			options?: Self.SplitPanel.ItemProps;

		}

		interface FlatItemConfiguration extends Self.SplitPanel.ItemProps {
			component: PackageCore.Component;

		}

		type ItemConfiguration = (PackageCore.Component | Self.SplitPanel.StructuredItemConfiguration | Self.SplitPanel.FlatItemConfiguration);

		export import Orientation = Self.SplitPanelItem.Orientation;

		export import ItemSize = Self.SplitPanelItem.Size;

		export import HandleStyle = Self.SplitPanelItem.HandleStyle;

		export import ItemCollapse = Self.SplitPanelItem.Collapse;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class SplitPanelItem extends PackageCore.Component {
		constructor(options?: Self.SplitPanelItem.Options);

		component: PackageCore.Component;

		children: PackageCore.VDom.Children;

		value: any;

		size: Self.SplitPanel.ItemSize;

		minSize: (string | number);

		maxSize: (string | number);

		handleStyle: Self.SplitPanel.HandleStyle;

		collapse: Self.SplitPanel.ItemCollapse;

		collapsed: boolean;

		resizable: boolean;

		effectiveResizable: boolean;

		setCollapsed(value: boolean): void;

		static Event: Self.SplitPanelItem.EventTypes;

	}

	export namespace SplitPanelItem {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			collapse?: Self.SplitPanel.ItemCollapse;

			component: PackageCore.Component;

			value?: any;

			handleStyle?: Self.SplitPanel.HandleStyle;

			maxSize?: (string | number);

			minSize?: (string | number);

			resizable?: boolean;

			size?: (Self.SplitPanelItem.SizeOptions | string | number);

		}

		interface SizeOptions {
			grow: number;

			shrink: number;

			basis: (number | string);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			RESIZE_STARTED: string;

			RESIZE_UPDATE: string;

			RESIZE_FINISHED: string;

		}

		enum Orientation {
			HORIZONTAL,
			VERTICAL,
		}

		enum Size {
			AUTO_SIZE,
			INITIAL_SIZE,
			FRACTION_SIZE,
			CONTENT_SIZE,
		}

		enum HandleStyle {
			GRAB_BEFORE,
			GRAB_AFTER,
			STRIP,
			TRANSPARENT,
		}

		enum Collapse {
			NONE,
			START,
			END,
		}

	}

	export class StackPanel extends PackageCore.Component {
		constructor(options?: Self.StackPanel.Options);

		items: globalThis.Array<Self.StackPanelItem>;

		components: globalThis.Array<PackageCore.Component>;

		children: PackageCore.VDom.Children;

		length: number;

		empty: boolean;

		orientation: Self.StackPanel.Orientation;

		wrap: (boolean | Self.StackPanel.Wrap);

		justification: Self.StackPanel.Justification;

		alignment: Self.StackPanel.Alignment;

		wrappedContentAlignment: Self.StackPanel.WrappedContentAlignment;

		outerGap: (Self.StackPanel.GapSize | Self.StackPanel.GapSizeObject);

		itemGap: Self.StackPanel.GapSize;

		wrapGap: Self.StackPanel.GapSize;

		decorator: (PackageCore.Decorator | null);

		element: Self.StackPanel.Element;

		defaultItemOptions: Self.StackPanel.ItemProps;

		add(components: (Self.StackPanel.ItemConfiguration | globalThis.Array<Self.StackPanel.ItemConfiguration>)): Self.StackPanel;

		remove(componentOrIndex: (PackageCore.Component | number | globalThis.Array<(PackageCore.Component | number)>)): Self.StackPanel;

		move(args: {component: (PackageCore.Component | number); index: number; reason?: string}): Self.StackPanel;

		clear(): Self.StackPanel;

		replace(currentComponentOrIndex: (PackageCore.Component | number), newComponent: PackageCore.Component): void;

		has(component: PackageCore.Component): boolean;

		itemAtIndex(index: number): Self.StackPanelItem;

		itemForComponent(component: PackageCore.Component): Self.StackPanelItem;

		indexForComponent(component: PackageCore.Component): (number | null);

		setOrientation(value: Self.StackPanel.Orientation): void;

		setWrap(value: (boolean | Self.StackPanel.Wrap)): void;

		setJustification(value: Self.StackPanel.Justification): void;

		setAlignment(value: Self.StackPanel.Alignment): void;

		setWrappedContentAlignment(value: Self.StackPanel.WrappedContentAlignment): void;

		setOuterGap(value: Self.StackPanel.GapSize): void;

		setItemGap(value: Self.StackPanel.GapSize): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		static horizontal(items?: (object | globalThis.Array<PackageCore.Component> | globalThis.Array<Self.StackPanelItem.Options>)): Self.StackPanel;

		static Horizontal(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static HorizontalReverse(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static vertical(items?: (object | globalThis.Array<PackageCore.Component> | globalThis.Array<Self.StackPanelItem.Options>)): Self.StackPanel;

		static Vertical(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static VerticalReverse(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static horizontalSplit(start: Self.StackPanel.ItemConfiguration, end: Self.StackPanel.ItemConfiguration, options?: Self.StackPanel.Options): void;

		static HorizontalSplit(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static verticalSplit(start: Self.StackPanel.ItemConfiguration, end: Self.StackPanel.ItemConfiguration, options?: Self.StackPanel.Options): void;

		static VerticalSplit(props: Self.StackPanel.Options): PackageCore.JSX.Element;

		static getStyles(): void;

		static Event: Self.StackPanel.EventTypes;

		static Item(props?: Self.StackPanel.JsxItemProps): PackageCore.JSX.Element;

	}

	export namespace StackPanel {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			alignment?: Self.StackPanel.Alignment;

			decorator?: PackageCore.Decorator;

			defaultItemOptions?: Self.StackPanel.ItemProps;

			itemGap?: Self.StackPanel.GapSize;

			wrapGap?: Self.StackPanel.GapSize;

			items?: (Self.StackPanel.ItemConfiguration | globalThis.Array<Self.StackPanel.ItemConfiguration>);

			justification?: Self.StackPanel.Justification;

			orientation?: Self.StackPanel.Orientation;

			outerGap?: (Self.StackPanel.GapSize | Self.StackPanel.GapSizeObject);

			wrap?: (Self.StackPanel.Wrap | boolean);

			element?: Self.StackPanel.Element;

			wrappedContentAlignment?: Self.StackPanel.WrappedContentAlignment;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

			ITEM_MOVED: string;

		}

		interface BaseItemProps {
			grow?: number;

			shrink?: number;

			basis?: string;

			selfAlignment?: Self.StackPanelItem.SelfAlignment;

		}

		interface ItemProps extends Self.StackPanel.BaseItemProps {
			index?: number;

		}

		interface JsxItemProps extends Self.StackPanel.BaseItemProps {
			children?: PackageCore.VDom.Children;

			key?: any;

		}

		interface StructuredItemConfiguration {
			component: PackageCore.Component;

			options?: Self.StackPanel.ItemProps;

		}

		interface FlatItemConfiguration extends Self.StackPanel.ItemProps {
			component: PackageCore.Component;

		}

		interface GapSizeObject {
			top?: Self.StackPanel.GapSize;

			bottom?: Self.StackPanel.GapSize;

			start?: Self.StackPanel.GapSize;

			end?: Self.StackPanel.GapSize;

			horizontal?: Self.StackPanel.GapSize;

			vertical?: Self.StackPanel.GapSize;

		}

		type ItemConfiguration = (PackageCore.Component | Self.StackPanel.StructuredItemConfiguration | Self.StackPanel.FlatItemConfiguration);

		enum Orientation {
			HORIZONTAL,
			HORIZONTAL_REVERSE,
			VERTICAL,
			VERTICAL_REVERSE,
		}

		enum Justification {
			START,
			END,
			CENTER,
			SPACE_AROUND,
			SPACE_BETWEEN,
			SPACE_EVENLY,
		}

		enum Alignment {
			NORMAL,
			START,
			END,
			CENTER,
			STRETCH,
			BASELINE,
		}

		enum Wrap {
			NO_WRAP,
			WRAP,
			WRAP_REVERSE,
		}

		export import Element = PackageCore.Html.Element.Section;

		export import SelfAlignment = Self.StackPanelItem.SelfAlignment;

		enum WrappedContentAlignment {
			START,
			END,
			CENTER,
			STRETCH,
			SPACE_AROUND,
			SPACE_BETWEEN,
		}

		export import GapSize = Self.GapSize;

		enum VisualStyle {
			BLOCK,
			INLINE,
			PLAIN,
		}

		export import ItemOptions = Self.StackPanelItemLayout;

		export import Decorator = PackageCore.Decorator;

	}

	export class StackPanelItem {
		constructor(options?: Self.StackPanelItem.Options);

		component: PackageCore.Component;

		selfAlignment: Self.StackPanelItem.SelfAlignment;

		grow: number;

		shrink: number;

		basis: string;

		index: number;

		setSelfAlignment(value: Self.StackPanelItem.SelfAlignment): void;

		setGrow(value: number): void;

		setShrink(value: number): void;

		setBasis(value: string): void;

	}

	export namespace StackPanelItem {
		interface Options {
			component: PackageCore.Component;

			grow?: number;

			shrink?: number;

			basis?: string;

			selfAlignment?: Self.StackPanelItem.SelfAlignment;

			index?: number;

		}

		enum SelfAlignment {
			START,
			END,
			CENTER,
			STRETCH,
			AUTO,
		}

	}

	namespace StackPanelItemLayout {
		const FILL_SPACE: Self.StackPanel.ItemProps;

		const EQUAL_SIZE: Self.StackPanel.ItemProps;

		const KEEP_SIZE: Self.StackPanel.ItemProps;

		function FRACTION_SIZE(fraction: number): Self.StackPanel.ItemProps;

	}

	namespace StandardWindow {
	}

	class StaticListView extends PackageCore.Component {
		constructor();

		stickyGroupHeaders: boolean;

		groupAutomationIdMember: (string | null);

		scrollTo(item: object): void;

		static Event: Self.StaticListView.EventTypes;

	}

	namespace StaticListView {
		interface EventTypes extends PackageCore.Component.EventTypes {
			SCROLL_TO_END: string;

		}

	}

	class StaticTreeContainer extends PackageCore.Component {
		constructor();

	}

	namespace StaticTreeContainer {
	}

	export class Stepper extends PackageCore.Component {
		constructor(options?: Self.Stepper.Options);

		children: PackageCore.VDom.Children;

		items: globalThis.Array<object>;

		selectedStepIndex: (number | null);

		orientation: Self.Stepper.Orientation;

		descriptionPosition: Self.Stepper.DescriptionPosition;

		separatorSize: Self.Stepper.SeparatorSize;

		labelGenerator: (index: number, options: object) => (string | number | PackageCore.Translation | PackageCore.JSX.Element | PackageCore.Component);

		descriptionGenerator: (index: number, options: object) => (string | number | PackageCore.Translation | PackageCore.JSX.Element | PackageCore.Component);

		defaultItemOptions: object;

		onSelectionChanged: (Self.Stepper.SelectionChangedCallback | null);

		setItems(items: globalThis.Array<object>): void;

		setSelectedStepIndex(index: number, reason: (string | symbol)): void;

		static Horizontal(props: Self.Stepper.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.Stepper.Options): PackageCore.JSX.Element;

		static Event: Self.Stepper.EventTypes;

		static defaultLabelGenerator(index: number, props: object): (PackageCore.JSX.Element | string);

		static defaultDescriptionGenerator(index: number, props: object): PackageCore.Translation;

	}

	export namespace Stepper {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			orientation?: Self.Stepper.Orientation;

			descriptionPosition?: Self.Stepper.DescriptionPosition;

			separatorSize?: Self.Stepper.SeparatorSize;

			selectedStepIndex: (number | null);

			labelGenerator?: (index: number, options: object) => ((number | string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element));

			descriptionGenerator?: (index: number, options: object) => ((number | string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element));

			defaultItemOptions?: object;

			onSelectionChanged?: Self.Stepper.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.Stepper.SelectionChangedArgs, sender: Self.Stepper) => void;

		interface SelectionChangedArgs {
			stepIndex: number;

			previousStepIndex: number;

			reason: Self.Stepper.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED_STEP_INDEX_CHANGED: symbol;

			STEP_ACTIVATED: string;

			STEP_DEACTIVATED: string;

		}

		export import Item = Self.StepperItem;

		export import Orientation = Self.StepperItem.Orientation;

		export import DescriptionPosition = Self.StepperItem.DescriptionPosition;

		export import SeparatorSize = Self.StepperItem.SeparatorSize;

		export import ItemType = Self.StepperItem.Type;

		enum Reason {
			CALL,
		}

		enum I18N {
			STEP,
		}

	}

	export class StepperItem extends PackageCore.Component {
		constructor(options?: Self.StepperItem.Options);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		description: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		children: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		orientation: Self.StepperItem.Orientation;

		descriptionPosition: Self.StepperItem.DescriptionPosition;

		separatorSize: Self.StepperItem.SeparatorSize;

		type: Self.StepperItem.Type;

		separatorStart: boolean;

		separatorEnd: boolean;

		selected: boolean;

		optional: boolean;

		onActivate: (item: Self.StepperItem, index: number) => boolean;

		onDeactivate: (item: Self.StepperItem, index: number) => boolean;

		index: number;

		static Event: Self.StepperItem.EventTypes;

	}

	export namespace StepperItem {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			orientation?: Self.StepperItem.Orientation;

			descriptionPosition?: Self.StepperItem.DescriptionPosition;

			separatorSize?: Self.StepperItem.SeparatorSize;

			type?: Self.StepperItem.Type;

			separatorStart?: boolean;

			separatorEnd?: boolean;

			selected?: boolean;

			optional?: boolean;

			onActivate?: (item: Self.StepperItem, index: number) => boolean;

			onDeactivate?: (item: Self.StepperItem, index: number) => boolean;

			index: number;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			STEP_ACTIVATED: symbol;

			STEP_DEACTIVATED: symbol;

		}

		enum Reason {
			CALL,
			ENTER,
			CLICK,
		}

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

		enum DescriptionPosition {
			TOP,
			BOTTOM,
			START,
			END,
		}

		enum Type {
			DEFAULT,
			NEUTRAL,
			PRIMARY,
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

		enum SeparatorSize {
			NONE,
			XS,
			S,
			M,
			L,
			XL,
			STRETCH,
		}

	}

	export namespace Studio {
		interface Project {
			components: object;

		}

		function Component(props: {project: Self.Studio.Project; component: string; bundles?: globalThis.Array<any>}): (props?: object) => PackageCore.Component;

	}

	export class SummaryBox extends PackageCore.Component {
		constructor(options?: Self.SummaryBox.Options);

		title: (string | number | PackageCore.Translation);

		collapsed: boolean;

		collapsible: boolean;

		currency: (string | number | PackageCore.Translation | null);

		children: PackageCore.VDom.Children;

		items: globalThis.Array<Self.SummaryBox.ItemOptions>;

		private parseChildren(children: PackageCore.VDom.Children): globalThis.Array<Self.SummaryBox.ItemOptions>;

		static Item(props?: Self.SummaryBoxItem.Options): PackageCore.JSX.Element;

		static Total(props?: Self.SummaryBoxTotal.Options): PackageCore.JSX.Element;

	}

	export namespace SummaryBox {
		interface ItemOptions {
			label: (string | number | PackageCore.Translation);

			color?: Self.SummaryBoxItem.Color;

			icon?: Self.Image.Source;

			value: (string | number | PackageCore.Translation);

			type: Self.SummaryBox.Type;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<Self.SummaryBox.ItemOptions>;

			collapsed?: boolean;

			collapsible?: boolean;

			currency?: (string | number | PackageCore.Translation);

			title: (string | number | PackageCore.Translation);

		}

		export import Color = Self.SummaryBoxItem.Color;

		enum Type {
			ITEM,
			TOTAL,
		}

	}

	export function SummaryBoxItem(options?: Self.SummaryBoxItem.Options): void;

	export namespace SummaryBoxItem {
		interface Options {
			label: (string | number | PackageCore.Translation);

			color?: Self.SummaryBoxItem.Color;

			icon?: Self.Image.Source;

			value: (string | number | PackageCore.Translation);

		}

		enum Color {
			NEUTRAL,
			INFO,
			SUCCESS,
			WARNING,
			ERROR,
		}

	}

	export function SummaryBoxTotal(options?: Self.SummaryBoxTotal.Options): void;

	export namespace SummaryBoxTotal {
		interface Options {
			label: (string | number | PackageCore.Translation);

			value: (string | number | PackageCore.Translation);

		}

	}

	export class Switch extends PackageCore.Component {
		constructor(options?: Self.Switch.Options);

		value: boolean;

		iconOn: PackageCore.ImageMetadata;

		iconOff: PackageCore.ImageMetadata;

		readOnly: boolean;

		action: (Self.Switch.ActionCallback | null);

		label: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | null);

		labelPosition: Self.Switch.LabelPosition;

		clickableLabel: boolean;

		emptyLabel: boolean;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		size: Self.Switch.Size;

		setValue(value: boolean, options?: {reason?: (string | symbol)}): void;

		toggle(options?: object): void;

		static Event: Self.Switch.EventTypes;

	}

	export namespace Switch {
		interface Options extends PackageCore.Component.Options {
			iconOff?: PackageCore.ImageMetadata;

			iconOn?: PackageCore.ImageMetadata;

			readOnly?: boolean;

			value?: boolean;

			action?: Self.Switch.ActionCallback;

			clickableLabel?: boolean;

			label?: (string | number | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			labelPosition?: Self.Switch.LabelPosition;

			size?: Self.Switch.Size;

		}

		type ActionCallback = (args: Self.Switch.ActionArgs, sender: Self.Switch) => void;

		interface ActionArgs {
			value: boolean;

			previousValue: boolean;

			reason: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TOGGLED: string;

		}

		enum Reason {
			SETTER,
			CLICK,
			KEY_PRESS,
		}

		enum LabelPosition {
			LEFT,
			RIGHT,
			ABOVE,
			BELOW,
		}

		enum Size {
			M,
			S,
		}

		enum VisualStyle {
			STANDALONE,
		}

	}

	class SystemHeader extends PackageCore.Component {
		constructor(options?: Self.SystemHeader.Options);

		logos: globalThis.Array<PackageCore.JSX.Element>;

		withSeparator: boolean;

		environment: Self.SystemHeader.Environment;

	}

	namespace SystemHeader {
		interface Options extends PackageCore.Component.Options {
			logos?: globalThis.Array<PackageCore.JSX.Element>;

			withSeparator?: boolean;

			environment?: Self.SystemHeader.Environment;

		}

		enum Environment {
			PRODUCTION,
			RELEASE_PREVIEW,
			SANDBOX,
			F,
			SNAP,
			DEBUGGER,
		}

	}

	class SystemSearch {
		addPageSearchItem(item: Self.PageSearch.SearchableItem, options: Self.PageSearch.SearchableItemOptions): void;

		addPageSearchItems(items: globalThis.Array<Self.PageSearch.SearchableItem>, options: Self.PageSearch.SearchableItemOptions): void;

		removePageSearchItem(itemId: string): void;

	}

	namespace SystemSearch {
		interface Options {
			searchTermValidator?: () => boolean;

			showResultsDelay?: number;

			globalSearch?: object;

			pageSearch?: object;

			shortcut?: globalThis.Array<globalThis.Array<string>>;

		}

	}

	export class Tab extends PackageCore.Component {
		constructor(options?: Self.Tab.Options);

		label: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		labelEditor: (Self.InlineEditor | null);

		allowLabelEditing: boolean;

		icon: object;

		contextControls: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

		actionControls: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

		value: any;

		selected: boolean;

		defaultSelected: boolean;

		closable: boolean;

		accessKey: string;

		accessShortcut: PackageCore.KeyShortcut;

		contentId: string;

		editorOptions: Self.InlineEditor.Options;

		dropBefore: boolean;

		dropAfter: boolean;

		setLabel(label: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element), reason?: string): void;

		setIcon(icon: (PackageCore.ImageMetadata | null)): void;

		setSelected(selected: boolean, reason?: any): void;

		setAccessKey(key: string): void;

		setClosable(closable: boolean): void;

		static Event: Self.Tab.EventTypes;

	}

	export namespace Tab {
		interface Options extends PackageCore.Component.Options {
			value?: any;

			icon?: Self.Image.Source;

			label: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			contextControls?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

			actionControls?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

			selected?: boolean;

			defaultSelected?: boolean;

			closable?: boolean;

			accessKey?: string;

			allowLabelEditing?: boolean;

			editorOptions?: Self.InlineEditor.Options;

			hierarchy?: Self.Tab.Hierarchy;

			position?: Self.Tab.Position;

			stripePosition?: Self.Tab.StripePosition;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			LABEL_CHANGED: string;

			LABEL_EDITING_STARTED: string;

			LABEL_EDITING_FINISHED: string;

			SELECTED: string;

			CLOSE: string;

		}

		export import VisualStyle = Self.TabPanelOptions.VisualStyle;

		export import Hierarchy = Self.TabPanelOptions.Hierarchy;

		export import Position = Self.TabPanelOptions.TabPosition;

		export import StripePosition = Self.TabPanelOptions.TabStripePosition;

		export import Reason = Self.TabPanelOptions.Reason;

	}

	class TabListDragSource {
		constructor();

	}

	namespace TabListDragSource {
	}

	class TabListDragTarget {
		constructor(tabList: (Self.ScrollTabList));

	}

	namespace TabListDragTarget {
	}

	export class TabPanel extends PackageCore.Component {
		constructor(options?: Self.TabPanel.Options);

		items: globalThis.Array<Self.TabPanelItem>;

		components: globalThis.Array<PackageCore.Component>;

		element: Self.TabPanel.Element;

		children: PackageCore.VDom.Children;

		length: number;

		empty: boolean;

		tabPosition: Self.TabPanel.TabPosition;

		tabStripePosition: Self.TabPanel.TabStripePosition;

		tabJustification: Self.TabPanel.TabPosition;

		tabReorder: boolean;

		hierarchy: Self.TabPanel.Hierarchy;

		divider: boolean;

		selectedValue: any;

		selectedComponent: PackageCore.Component;

		selectedItem: (Self.TabPanelItem | null);

		selectedIndex: number;

		outerGap: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

		tabsGap: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

		contentGap: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

		tabSpacer: (boolean | null);

		decorator: (PackageCore.Decorator | null);

		tabsDecorator: (PackageCore.Decorator | null);

		defaultItemOptions: Self.TabPanel.ItemProps;

		setSelectedValue(value: any, args?: {reason?: string}): void;

		add(component: (Self.TabPanel.ItemConfiguration | globalThis.Array<Self.TabPanel.ItemConfiguration>)): Self.TabPanel;

		remove(componentOrIndex: (PackageCore.Component | number | globalThis.Array<(PackageCore.Component | number)>)): Self.TabPanel;

		move(args: {component: (PackageCore.Component | number); index: number; reason?: string}): Self.TabPanel;

		clear(): Self.TabPanel;

		replace(currentComponent: (PackageCore.Component | number), newComponent: PackageCore.Component): Self.TabPanel;

		has(component: PackageCore.Component): boolean;

		itemForComponent(component: PackageCore.Component): (Self.TabPanelItem | null);

		itemAtIndex(index: number): (Self.TabPanelItem | null);

		select(component: (PackageCore.Component | number), reason?: string): void;

		isSelected(component: PackageCore.Component): boolean;

		selectFirst(reason?: string): void;

		selectLast(reason?: string): void;

		selectNext(reason?: string): void;

		selectPrevious(reason?: string): void;

		setOuterGap(value: Self.TabPanel.GapSize): void;

		setTabsGap(value: Self.TabPanel.GapSize): void;

		setContentGap(value: Self.TabPanel.GapSize): void;

		setTabSpacer(value: boolean): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

		setTabsDecorator(decorator: (PackageCore.Decorator | null)): void;

		getTab(component: PackageCore.Component): (Self.Tab | null);

		static TabLabelUpdater(args: object): void;

		static Item(props: Self.TabPanel.JsxItemProps): PackageCore.JSX.Element;

		static Event: Self.TabPanel.EventTypes;

	}

	export namespace TabPanel {
		interface BaseItemProps {
			value?: any;

			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			contextControls?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

			actionControls?: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)>);

			closable?: boolean;

			accessKey?: string;

			allowLabelEditing?: boolean;

			editorOptions?: Self.InlineEditor.Options;

			automationId?: string;

		}

		interface ItemProps extends Self.TabPanel.BaseItemProps {
			selected?: boolean;

		}

		interface JsxItemProps extends Self.TabPanel.BaseItemProps {
			children?: PackageCore.VDom.Children;

			key?: any;

			ref?: PackageCore.VDomRef;

		}

		interface GapSizeObject {
			top?: Self.TabPanel.GapSize;

			bottom?: Self.TabPanel.GapSize;

			start?: Self.TabPanel.GapSize;

			end?: Self.TabPanel.GapSize;

			horizontal?: Self.TabPanel.GapSize;

			vertical?: Self.TabPanel.GapSize;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			hierarchy?: Self.TabPanel.Hierarchy;

			items?: (Self.TabPanel.ItemConfiguration | globalThis.Array<Self.TabPanel.ItemConfiguration>);

			selectedValue?: any;

			onBeforeTabClose?: (tab: Self.Tab) => boolean;

			tabJustification?: Self.TabPanel.TabJustification;

			tabPosition?: Self.TabPanel.TabPosition;

			tabStripePosition?: Self.TabPanel.TabStripePosition;

			tabReorder?: boolean;

			outerGap?: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

			tabsGap?: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

			contentGap?: (Self.TabPanel.GapSize | Self.TabPanel.GapSizeObject);

			tabSpacer?: boolean;

			divider?: boolean;

			defaultItemOptions?: Self.TabPanel.ItemProps;

			tabListOptions?: Self.ScrollTabList.Options;

			decorator?: PackageCore.Decorator;

			tabsDecorator?: PackageCore.Decorator;

			element?: Self.TabPanel.Element;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

			ITEM_MOVED: string;

			ITEM_SELECTED: string;

			TAB_SELECTED: string;

			TAB_CLOSED: string;

			TAB_REORDER: string;

			TAB_LABEL_EDITING_STARTED: string;

			TAB_LABEL_EDITING_FINISHED: string;

			TAB_LABEL_CHANGED: string;

		}

		interface StructuredItemConfiguration {
			component: PackageCore.Component;

			options?: Self.TabPanel.ItemProps;

		}

		interface FlatItemConfiguration extends Self.TabPanel.ItemProps {
			component: PackageCore.Component;

		}

		type ItemConfiguration = (PackageCore.Component | Self.TabPanel.StructuredItemConfiguration | Self.TabPanel.FlatItemConfiguration);

		export import TabPosition = Self.TabPanelOptions.TabPosition;

		export import TabStripePosition = Self.TabPanelOptions.TabStripePosition;

		export import TabJustification = Self.TabPanelOptions.TabJustification;

		export import TabOverflow = Self.TabPanelOptions.TabOverflow;

		export import Hierarchy = Self.TabPanelOptions.Hierarchy;

		export import GapSize = Self.GapSize;

		export import Decorator = PackageCore.Decorator;

		export import VisualStyle = Self.TabPanelOptions.VisualStyle;

		enum ContentUpdateReason {
			ITEM_ADDED,
			ITEM_REMOVED,
			ITEM_MOVED,
			ITEM_SELECTED,
			SELECTED_VALUE_CHANGED,
			TAB_LIST_POSITION_CHANGED,
		}

		export import Reason = Self.TabPanelOptions.Reason;

		export import Element = PackageCore.Html.Element.Section;

	}

	export class TabPanelItem {
		constructor(options: Self.TabPanelItem.Options);

		component: PackageCore.Component;

		tab: Self.Tab;

		selected: boolean;

		closable: boolean;

		icon: Self.Image.Source;

		label: (string | PackageCore.Translation);

		contextControls: globalThis.Array<PackageCore.Component>;

		actionControls: globalThis.Array<PackageCore.Component>;

		accessShortcut: PackageCore.KeyShortcut;

		setSelected(value: boolean): void;

		setClosable(value: boolean): void;

		setIcon(icon: Self.Image.Source, reason: string): void;

		setLabel(label: (string | PackageCore.Translation)): void;

	}

	export namespace TabPanelItem {
		interface Options extends PackageCore.Component.Options {
			component: PackageCore.Component;

			tab: Self.Tab;

		}

	}

	namespace TabPanelOptions {
		enum Hierarchy {
			PRIMARY,
			SECONDARY,
		}

		enum TabPosition {
			TOP,
			BOTTOM,
			LEFT,
			RIGHT,
		}

		enum TabStripePosition {
			START,
			END,
		}

		enum TabJustification {
			START,
			STRETCH,
			END,
		}

		enum TabOverflow {
			SCROLL,
			POPUP,
		}

		enum VisualStyle {
			STANDALONE,
			LEGACY,
		}

		enum Reason {
			CALL,
			CLICK,
			ACCESS_KEY,
			KEY_DOWN,
			ITEM_ADDED,
			ITEM_REMOVED,
			DRAG,
			LABEL_SYNC,
		}

	}

	export class Table extends PackageCore.Component {
		constructor(options?: Self.Table.Options);

		children: PackageCore.VDom.Children;

		caption: (string | null);

		header: (globalThis.Array<any> | null);

		body: globalThis.Array<globalThis.Array<any>>;

		footer: (globalThis.Array<any> | null);

		private renderTableCaption(): PackageCore.JSX.Element;

		private renderTableHeader(): PackageCore.JSX.Element;

		private renderTableBody(): PackageCore.JSX.Element;

		private renderTableFooter(): PackageCore.JSX.Element;

		private renderCell(cellOptions: (string | number | PackageCore.Translation | PackageCore.Component | object), cellType: symbol): PackageCore.JSX.Element;

		private renderTable(): globalThis.Array<PackageCore.JSX.Element>;

		private normalizeContent(content: any): globalThis.Array<(PackageCore.Component | string)>;

		static Header(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static Body(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static Footer(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static Row(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static HeaderCell(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static Cell(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

		static Caption(args: {classList?: (string | globalThis.Array<string> | PackageCore.Style | globalThis.Array<PackageCore.Style>); rootStyle?: object; rootAttributes?: object; children?: PackageCore.VDom.Children; key?: any}): PackageCore.JSX.Element;

	}

	export namespace Table {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			body?: (globalThis.Array<globalThis.Array<any>> | null);

			caption?: (string | Self.Text | null);

			footer?: (globalThis.Array<any> | null);

			header?: (globalThis.Array<any> | null);

		}

	}

	export class TemplatedCell extends Self.GridCell {
		constructor(options: Self.TemplatedCell.Options);

	}

	export namespace TemplatedCell {
		interface Options extends Self.GridCell.Options {
		}

	}

	export class TemplatedColumn extends Self.GridColumn {
		constructor(options?: Self.TemplatedColumn.Options);

		content: (Self.TemplatedColumn.ContentCallback | null);

		copyValueProvider: (Self.TemplatedColumn.CopyValueProvider | null);

	}

	export namespace TemplatedColumn {
		interface Options extends Self.GridColumn.Options {
			content: Self.TemplatedColumn.ContentCallback;

			copyValueProvider?: Self.TemplatedColumn.CopyValueProvider;

		}

		type ContentCallback = (args: Self.TemplatedColumn.ContentArgs) => (PackageCore.Component | PackageCore.JSX.Element);

		interface ContentArgs {
			cell: Self.TemplatedCell;

			context: any;

		}

		type CopyValueProvider = (cell: Self.TemplatedCell) => (string | Element);

		export import Cell = Self.TemplatedCell;

	}

	export class Text extends PackageCore.Component {
		constructor(options?: (Self.Text.Options | string | number | PackageCore.Translation));

		text: (string | number | PackageCore.Translation);

		children: PackageCore.VDom.Children;

		type: Self.Text.Type;

		size: (Self.Text.Size | null);

		weight: (Self.Text.Weight | null);

		color: (Self.Text.Color | null);

		fontStyle: (Self.Text.FontStyle | null);

		decoration: (Self.Text.Decoration | null);

		decorator: (PackageCore.Decorator | null);

		wrap: (boolean | number);

		whitespace: boolean;

		ellipsisHelper: Self.EllipsisTooltip;

		setText(text: (string | number | PackageCore.Translation)): void;

		setType(type: Self.Text.Type): void;

		setWrap(value: (boolean | number)): void;

		setWhitespace(value: boolean): void;

		setDecorator(decorator: (PackageCore.Decorator | null)): void;

	}

	export namespace Text {
		interface KeyboardOptions {
			inverse?: boolean;

		}

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			decorator?: PackageCore.Decorator;

			text?: (string | number | PackageCore.Translation);

			type?: Self.Text.Type;

			color?: Self.Text.Color;

			size?: Self.Text.Size;

			weight?: Self.Text.Weight;

			fontStyle?: Self.Text.FontStyle;

			decoration?: Self.Text.Decoration;

			whitespace?: boolean;

			wrap?: (boolean | number);

		}

		enum Size {
			XXS,
			XS,
			S,
			M,
			L,
			XL,
			XXL,
			XXXL,
		}

		enum Weight {
			NORMAL,
			SEMI_BOLD,
			BOLD,
		}

		enum Color {
			PRIMARY,
			SECONDARY,
			PLACEHOLDER,
		}

		enum Type {
			DEFAULT,
			STRONG,
			WEAK,
		}

		enum FontStyle {
			NORMAL,
			ITALIC,
		}

		enum Decoration {
			NONE,
			UNDERLINE,
		}

	}

	export class TextArea extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.TextArea.Options);

		text: string;

		defaultText: (string | number);

		name: string;

		acceptedText: string;

		formattedText: string;

		placeholder: (string | PackageCore.Translation);

		maxLength: number;

		maxLengthIndicator: boolean;

		empty: boolean;

		mandatory: boolean;

		selection: Self.TextArea.Selection;

		caretPosition: number;

		hasMaxLength: boolean;

		autoComplete: (Self.TextArea.AutoComplete | string);

		textAlignment: Self.TextArea.TextAlignment;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		rowCount: number;

		columnCount: number;

		resizable: boolean;

		formatter: (Self.TextArea.FormatterCallback | null);

		textValidator: (Self.TextArea.TextValidatorCallback | null);

		keyValidator: (Self.TextArea.KeyValidatorCallback | null);

		size: Self.TextArea.Size;

		onTextChanged: (Self.TextArea.TextChangedCallback | null);

		onTextAccepted: (Self.TextArea.TextAcceptedCallback | null);

		bloom: boolean;

		setText(text: (string | number), options?: {reason?: string; accept?: boolean}): boolean;

		setName(name: string): void;

		setSelection(options: {start: number; end: number; direction?: Self.TextArea.SelectionDirection; reason?: string}): boolean;

		setCaretPosition(position: number): void;

		setMaxLength(maxLength: number): boolean;

		setMaxLengthIndicator(value: boolean): void;

		setMandatory(mandatory: boolean): void;

		setPlaceholder(placeholder: (string | PackageCore.Translation)): void;

		setRowCount(rowCount: number): void;

		setColumnCount(columnCount: number): void;

		setTextAlignment(alignment: Self.TextArea.TextAlignment): void;

		setAutoComplete(value: string): void;

		setResizable(resizable: boolean): void;

		selectAll(): void;

		acceptChanges(options: {reason?: string}): void;

		static Event: Self.TextArea.EventTypes;

	}

	export namespace TextArea {
		interface Options extends PackageCore.Component.Options {
			acceptInvalidValue?: boolean;

			autoComplete?: string;

			columnCount?: number;

			formatter?: Self.TextArea.FormatterCallback;

			keyValidator?: Self.TextArea.KeyValidatorCallback;

			maxLength?: number;

			maxLengthIndicator?: boolean;

			placeholder?: (string | PackageCore.Translation);

			resizable?: boolean;

			resizeDirection?: Self.TextArea.ResizeDirection;

			rowCount?: number;

			text?: (string | number);

			defaultText?: (string | number);

			textAlignment?: Self.TextArea.TextAlignment;

			textValidator?: Self.TextArea.TextValidatorCallback;

			mandatory?: boolean;

			size?: Self.TextArea.Size;

			onTextChanged?: Self.TextArea.TextChangedCallback;

			onTextAccepted?: Self.TextArea.TextAcceptedCallback;

			toolbar?: (PackageCore.Component | PackageCore.JSX.Element);

			bloom?: boolean;

		}

		type TextChangedCallback = (args: Self.TextArea.TextChangedArgs, sender: Self.TextArea) => void;

		interface TextChangedArgs {
			text: string;

			previousText: string;

			reason: Self.TextArea.TextChangeReason;

		}

		type TextAcceptedCallback = (args: Self.TextArea.TextAcceptedArgs, sender: Self.TextArea) => void;

		interface TextAcceptedArgs {
			text: string;

			previousText: string;

			reason: Self.TextArea.TextAcceptedReason;

		}

		type TextValidatorCallback = (args: {text: string}) => boolean;

		type KeyValidatorCallback = (args: {keyCode: number; charCode: number; char: string; text: string; selection: Self.TextArea.Selection}) => boolean;

		interface Selection {
			start: number;

			end: number;

			direction?: Self.TextArea.SelectionDirection;

			text?: string;

		}

		type FormatterCallback = (args: {text: string; valid: boolean}) => string;

		interface EventTypes extends PackageCore.Component.EventTypes {
			TEXT_CHANGED: string;

			TEXT_ACCEPTED: string;

			SELECTION_CHANGED: string;

			CARET_POSITION_CHANGED: string;

			AREA_RESIZED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
			REDWOOD_FIELD,
		}

		enum AutoComplete {
			ON,
			OFF,
		}

		enum TextAlignment {
			LEFT,
			RIGHT,
			CENTER,
		}

		enum TextChangeReason {
			INPUT,
			MAX_LENGTH,
		}

		enum TextAcceptedReason {
			FOCUS_OUT,
			ENTER,
			CALL,
		}

		enum SelectionChangeReason {
			SELECT_ALL,
			TEXT_CHANGED,
			REFRESH,
		}

		enum ResizeDirection {
			BOTH,
			HORIZONTAL,
			VERTICAL,
		}

		export import SelectionDirection = Self.TextSelection.Direction;

		export import Size = Self.InputSize;

	}

	export class TextAreaCell extends Self.GridCell {
		constructor();

		resizableEditor: boolean;

		popupEdit: boolean;

		popupHeight: number;

		formatter: (((args: {cell: Self.TextAreaCell; text: string}) => string) | null);

		wrap: boolean;

		overlayGuid: string;

		textArea: (Self.TextArea | null);

		widgetOptions: (Self.TextArea.Options | Self.GridCell.WidgetOptionsCallback<Self.TextArea.Options>);

	}

	export namespace TextAreaCell {
	}

	export class TextAreaColumn extends Self.GridColumn {
		constructor(options?: Self.TextAreaColumn.Options);

		resizableEditor: boolean;

		popupEdit: boolean;

		popupHeight: number;

		formatter: (Self.TextAreaColumn.FormatterCallback | null);

		wrap: boolean;

		widgetOptions: (Self.TextArea.Options | Self.GridColumn.WidgetOptionsCallback<Self.TextArea.Options> | null);

	}

	export namespace TextAreaColumn {
		interface Options extends Self.GridColumn.Options {
			resizableEditor?: boolean;

			popupEdit?: boolean;

			popupHeight?: number;

			formatter?: Self.TextAreaColumn.FormatterCallback;

			wrap?: boolean;

			widgetOptions?: (Self.TextArea.Options | Self.GridColumn.WidgetOptionsCallback<Self.TextArea.Options>);

		}

		type FormatterCallback = (args: Self.TextAreaColumn.FormatterArgs) => string;

		interface FormatterArgs {
			cell: Self.TextAreaCell;

			text: string;

		}

		export import Cell = Self.TextAreaCell;

	}

	export class TextBox extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.TextBox.Options);

		text: string;

		defaultText: (string | number);

		name: string;

		acceptedText: string;

		formattedText: string;

		placeholder: (string | PackageCore.Translation);

		maxLength: number;

		maxLengthIndicator: boolean;

		empty: boolean;

		mandatory: boolean;

		selection: Self.TextBox.Selection;

		caretPosition: number;

		hasMaxLength: boolean;

		autoComplete: (Self.TextBox.AutoComplete | string);

		textAlignment: Self.TextBox.TextAlignment;

		clearButton: boolean;

		inputSize: number;

		type: Self.TextBox.Type;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		formatter: (Self.TextBox.FormatterCallback | null);

		textValidator: (Self.TextBox.TextValidatorCallback | null);

		icon: (PackageCore.ImageMetadata | PackageCore.Component | PackageCore.JSX.Element | null);

		iconAlignment: Self.TextBox.IconAlignment;

		iconAction: (((args: object) => void) | null);

		keyValidator: (Self.TextBox.KeyValidatorCallback | null);

		overflowTooltip: boolean;

		spinner: (number | object | null);

		confirm: (Self.TextBox.ConfirmCallback | null);

		size: Self.TextBox.Size;

		overflowsHorizontally: (boolean | null);

		onTextChanged: (Self.TextBox.TextChangedCallback | null);

		onTextAccepted: (Self.TextBox.TextAcceptedCallback | null);

		setText(text: (string | number), options?: {reason?: string; accept?: boolean}): boolean;

		setName(name: string): void;

		clear(reason?: string): void;

		setSelection(options: {start: number; end: number; direction?: Self.TextBox.SelectionDirection; reason?: string}): boolean;

		setCaretPosition(position: number): void;

		setMaxLength(maxLength: number): void;

		setMaxLengthIndicator(value: boolean): void;

		setMandatory(mandatory: boolean): void;

		setPlaceholder(placeholder: (string | PackageCore.Translation)): void;

		setInputSize(size: number): void;

		setTextAlignment(alignment: Self.TextBox.TextAlignment): void;

		setType(type: Self.TextBox.Type): void;

		setAutoComplete(value: (string | Self.TextBox.AutoComplete)): void;

		setClearButton(value: boolean): void;

		setConfirm(confirm: (Self.TextBox.ConfirmCallback | null)): void;

		setSpinner(spinner: (number | object | null)): void;

		selectAll(): boolean;

		acceptChanges(options: {reason?: string}): void;

		setIconAlignment(value: Self.TextBox.IconAlignment): void;

		setIcon(value: (PackageCore.ImageMetadata | PackageCore.Component | HTMLElement)): void;

		static createSearchBox(options: Self.TextBox.Options): Self.TextBox;

		static Search(props: Self.TextBox.Options): PackageCore.JSX.Element;

		static createLoginBox(options: Self.TextBox.Options): Self.TextBox;

		static Login(props: Self.TextBox.Options): PackageCore.JSX.Element;

		static createPasswordBox(options: Self.TextBox.Options): Self.TextBox;

		static Password(props: Self.TextBox.Options): PackageCore.JSX.Element;

		static Event: Self.TextBox.EventTypes;

	}

	export namespace TextBox {
		interface Options extends PackageCore.Component.Options {
			acceptInvalidValue?: boolean;

			autoComplete?: string;

			ariaLabel?: string;

			clearButton?: boolean;

			formatter?: Self.TextBox.FormatterCallback;

			icon?: (PackageCore.ImageMetadata | PackageCore.Component | PackageCore.JSX.Element);

			iconAction?: (args: object) => void;

			iconAlignment?: Self.TextBox.IconAlignment;

			inputSize?: number;

			inputAttributes?: object;

			keyValidator?: Self.TextBox.KeyValidatorCallback;

			maxLength?: number;

			maxLengthIndicator?: boolean;

			mandatory?: boolean;

			name?: string;

			overflowTooltip?: boolean;

			placeholder?: (string | PackageCore.Translation);

			text?: (string | number);

			defaultText?: (string | number);

			textAlignment?: Self.TextBox.TextAlignment;

			textValidator?: Self.TextBox.TextValidatorCallback;

			confirm?: Self.TextBox.ConfirmCallback;

			type?: Self.TextBox.Type;

			spinner?: (number | object);

			size?: Self.TextBox.Size;

			onTextChanged?: Self.TextBox.TextChangedCallback;

			onTextAccepted?: Self.TextBox.TextAcceptedCallback;

		}

		type TextChangedCallback = (args: Self.TextBox.TextChangedArgs, sender: Self.TextBox) => void;

		interface TextChangedArgs {
			text: string;

			previousText: string;

			reason: Self.TextBox.TextChangeReason;

		}

		type TextAcceptedCallback = (args: Self.TextBox.TextAcceptedArgs, sender: Self.TextBox) => void;

		interface TextAcceptedArgs {
			text: string;

			previousText: string;

			reason: Self.TextBox.TextAcceptedReason;

		}

		type TextValidatorCallback = (args: {text: string}) => boolean;

		type KeyValidatorCallback = (args: {keyCode: number; charCode: number; char: string; text: string; selection: Self.TextBox.Selection}) => boolean;

		type FormatterCallback = (args: {text: string; valid: boolean}) => string;

		type ConfirmCallback = (args: {text: string}) => boolean;

		interface Selection {
			start: number;

			end: number;

			direction?: Self.TextBox.SelectionDirection;

			text?: string;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			TEXT_CHANGED: string;

			TEXT_ACCEPTED: string;

			SELECTION_CHANGED: string;

			CARET_POSITION_CHANGED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
			SYSTEM_HEADER,
			REDWOOD_FIELD,
		}

		enum Reason {
			CLEAR,
		}

		enum AutoComplete {
			ON,
			OFF,
		}

		enum TextAlignment {
			LEFT,
			RIGHT,
			CENTER,
		}

		enum TextChangeReason {
			INPUT,
			MAX_LENGTH,
		}

		enum TextAcceptedReason {
			FOCUS_OUT,
			ENTER,
			CALL,
		}

		enum SelectionChangeReason {
			SELECT_ALL,
			TEXT_CHANGED,
			REFRESH,
		}

		enum IconAlignment {
			START,
			END,
		}

		enum Type {
			TEXT,
			NUMBER,
			PASSWORD,
			FILE,
			EMAIL,
			URL,
		}

		export import SelectionDirection = Self.TextSelection.Direction;

		export import Size = Self.InputSize;

	}

	export class TextBoxCell extends Self.GridCell {
		constructor();

		textAlignment: Self.TextBox.TextAlignment;

		inputType: Self.TextBox.Type;

		formatter: (((args: {cell: Self.TextAreaCell; text: string}) => string) | null);

		wrap: boolean;

		textBox: (Self.TextBox | null);

		widgetOptions: (Self.TextBox.Options | Self.GridCell.WidgetOptionsCallback<Self.TextBox.Options>);

	}

	export namespace TextBoxCell {
	}

	export class TextBoxColumn extends Self.GridColumn {
		constructor(options?: Self.TextBoxColumn.Options);

		textAlignment: Self.TextBox.TextAlignment;

		inputType: Self.TextBox.Type;

		formatter: (Self.TextBoxColumn.FormatterCallback | null);

		wrap: boolean;

		widgetOptions: (Self.TextBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.TextBox.Options> | null);

	}

	export namespace TextBoxColumn {
		interface Options extends Self.GridColumn.Options {
			textAlignment?: Self.TextBox.TextAlignment;

			inputType?: Self.TextBox.Type;

			formatter?: Self.TextBoxColumn.FormatterCallback;

			wrap?: boolean;

			widgetOptions?: (Self.TextBox.Options | Self.GridColumn.WidgetOptionsCallback<Self.TextBox.Options>);

		}

		type FormatterCallback = (args: Self.TextBoxColumn.FormatterArgs) => string;

		interface FormatterArgs {
			cell: Self.TextBoxCell;

			text: string;

		}

		export import Cell = Self.TextBoxCell;

	}

	export class TextBoxPicker extends Self.Picker {
		constructor(options?: Self.TextBoxPicker.Options);

	}

	export namespace TextBoxPicker {
		interface Options extends PackageCore.Component.Options {
			textBoxOptions: Self.TextBox.Options;

		}

	}

	class TextSelection {
		constructor(start: number, end: number, direction?: Self.TextSelection.Direction, text?: string);

	}

	namespace TextSelection {
		enum Direction {
			FORWARD,
			BACKWARD,
		}

	}

	namespace TextStyle {
		function styles(css: object, wrap: (boolean | number), whitespace: boolean): globalThis.Array<PackageCore.Style>;

	}

	export function ThemeRoot(props: {theme: PackageCore.Theme; children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	function ThemeRootContent(props: {children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	export function ThemeSelector(props: {supportedThemes?: globalThis.Array<PackageCore.Theme.Name>; children?: PackageCore.VDom.Children}): PackageCore.JSX.Element;

	export class TimePicker extends PackageCore.Component implements PackageCore.InputComponent {
		constructor(options?: Self.TimePicker.Options);

		time: (PackageCore.Time | null);

		empty: boolean;

		mandatory: boolean;

		format: (string | null);

		formatter: (Self.TimePicker.FormatterCallback | null);

		parser: (Self.TimePicker.ParserCallback | null);

		startTime: (PackageCore.Time | null);

		endTime: (PackageCore.Time | null);

		inputText: string;

		inputId: string;

		inputAttributes: PackageCore.HtmlAttributeList;

		allowUserInput: boolean;

		timePickerOpened: boolean;

		iconPosition: Self.TimePicker.IconPosition;

		placeholder: (string | null);

		size: Self.TimePicker.Size;

		onTimeChanged: (Self.TimePicker.TimeChangedCallback | null);

		acceptChanges(): void;

		setTime(time: (PackageCore.Time | null), options?: {reason?: string; updateInputText?: string}): void;

		setInputText(text: string, options?: {reason?: string; acceptChanges?: boolean}): void;

		setFormat(format: string): void;

		setFormatter(formatter: (((time: (PackageCore.Time | null)) => string) | null)): void;

		setParser(parser: (((text: string) => (PackageCore.Time | null)) | null)): void;

		setStartTime(time: (PackageCore.Time | null)): void;

		setEndTime(time: (PackageCore.Time | null)): void;

		openTimePicker(): boolean;

		closeTimePicker(): boolean;

		toggleTimePicker(): void;

		selectAll(): void;

		static Event: Self.TimePicker.EventTypes;

	}

	export namespace TimePicker {
		interface Options extends PackageCore.Component.Options {
			allowEmptyValue?: boolean;

			validator?: Self.TimePicker.ValidatorCallback;

			endTime?: PackageCore.Time;

			format?: string;

			formatter?: Self.TimePicker.FormatterCallback;

			iconPosition?: Self.TimePicker.IconPosition;

			parser?: Self.TimePicker.ParserCallback;

			placeholder?: string;

			startTime?: PackageCore.Time;

			time?: PackageCore.Time;

			timeline?: object;

			mandatory?: boolean;

			allowUserInput?: boolean;

			picker?: object;

			size?: Self.TimePicker.Size;

			onTimeChanged?: Self.TimePicker.TimeChangedCallback;

		}

		type TimeChangedCallback = (args: Self.TimePicker.TimeChangedArgs, sender: Self.TimePicker) => void;

		interface TimeChangedArgs {
			time: (PackageCore.Time | null);

			previousTime: (PackageCore.Time | null);

			reason: Self.TimePicker.Reason;

		}

		type ValidatorCallback = (args: {empty: boolean; inputText: string; time: (PackageCore.Time | null)}) => void;

		type FormatterCallback = (time: (PackageCore.Time | null)) => string;

		type ParserCallback = (text: string) => (PackageCore.Time | null);

		interface EventTypes extends PackageCore.Component.EventTypes {
			TIME_CHANGED: string;

			INPUT_TEXT_CHANGED: string;

			INPUT_TEXT_ACCEPTED: string;

		}

		enum IconPosition {
			START,
			END,
		}

		enum Reason {
			AFTER,
			BEFORE,
			CLEAR,
			EMPTY,
			ENTER,
			INVALID_INPUT,
			PICKER_SELECTION_CHANGED,
			TEXT_CHANGED,
			TIME_CHANGED,
			TIME_FORMATTED,
		}

		export import Size = Self.InputSize;

	}

	export class TimePickerCell extends Self.GridCell {
		constructor();

		format: string;

		formatter: (time: (PackageCore.Time | null)) => string;

		parser: (text: string) => (PackageCore.Time | null);

		timePicker: (Self.TimePicker | null);

		bindToText: boolean;

		widgetOptions: (Self.TimePicker.Options | Self.GridCell.WidgetOptionsCallback<Self.TimePicker.Options>);

	}

	export namespace TimePickerCell {
	}

	export class TimePickerColumn extends Self.GridColumn {
		constructor(options?: Self.TimePickerColumn.Options);

		format: (string | null);

		formatter: (Self.TimePicker.FormatterCallback | null);

		parser: (Self.TimePicker.ParserCallback | null);

		bindToText: boolean;

		widgetOptions: (Self.TimePicker.Options | Self.GridColumn.WidgetOptionsCallback<Self.TimePicker.Options> | null);

		static defaultComparator(cell: Self.TimePickerCell, oldValue: (PackageCore.Time | string), newValue: (PackageCore.Time | string)): boolean;

	}

	export namespace TimePickerColumn {
		interface Options extends Self.GridColumn.Options {
			format?: string;

			formatter?: Self.TimePicker.FormatterCallback;

			parser?: Self.TimePicker.ParserCallback;

			bindToText?: boolean;

			widgetOptions?: (Self.TimePicker.Options | Self.GridColumn.WidgetOptionsCallback<Self.TimePicker.Options>);

		}

		export import Cell = Self.TimePickerCell;

	}

	export class TimeRange extends PackageCore.Component {
		constructor(options?: Self.TimeRange.Options);

		start: (Self.TimePicker | null);

		startRef: PackageCore.VDomRef;

		end: (Self.TimePicker | null);

		endRef: PackageCore.VDomRef;

		range: Self.TimeRange.Range;

		rangeStart: (PackageCore.Time | null);

		rangeEnd: (PackageCore.Time | null);

		inputOptions: Self.TimePicker.Options;

		startOptions: Self.TimePicker.Options;

		endOptions: Self.TimePicker.Options;

		onRangeChanged: (Self.TimeRange.RangeChangedCallback | null);

		setRange(value: Self.TimeRange.Range, options?: {reason?: string}): void;

		setRangeStart(startTime: (PackageCore.Time | null), options?: {reason?: string}): void;

		setRangeEnd(endTime: (PackageCore.Time | null), options?: {reason?: string}): void;

		static rangeEquals(left: (Self.TimeRange.Range | null), right: (Self.TimeRange.Range | null)): boolean;

		static Event: Self.TimeRange.EventTypes;

	}

	export namespace TimeRange {
		interface Options extends PackageCore.Component.Options {
			defaultInterval?: (((time: PackageCore.Time) => PackageCore.Time) | null);

			endOptions?: Self.TimePicker.Options;

			inputOptions?: Self.TimePicker.Options;

			range?: Self.TimeRange.Range;

			startOptions?: Self.TimePicker.Options;

			startRef?: PackageCore.VDomRef;

			endRef?: PackageCore.VDomRef;

			onRangeChanged?: Self.TimeRange.RangeChangedCallback;

		}

		interface Range {
			startTime: (PackageCore.Time | null);

			endTime: (PackageCore.Time | null);

		}

		type RangeChangedCallback = (args: Self.TimeRange.RangeChangedArgs, sender: Self.TimeRange) => void;

		interface RangeChangedArgs {
			range: (Self.TimeRange.Range | null);

			previousRange: (Self.TimeRange.Range | null);

			reason: Self.TimeRange.Reason;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			RANGE_CHANGED: string;

		}

		enum I18N {
			TO,
		}

		enum Reason {
			TIME_CHANGED,
			INTERVAL,
		}

	}

	export class TimeRangePicker extends Self.Picker {
		constructor(options: Self.TimeRangePicker.Options);

		private _handleSelectionChanged(args: Self.TimeRange.RangeChangedArgs): void;

	}

	export namespace TimeRangePicker {
		interface Options extends Self.Picker.Options {
		}

	}

	export class TimeSelectorPicker extends Self.Picker {
		constructor(options: Self.TimeSelectorPicker.Options);

		private _handleSelectionChanged(args: Self.TimePicker.TimeChangedArgs): void;

	}

	export namespace TimeSelectorPicker {
		interface Options extends Self.Picker.Options {
		}

	}

	export class ToggleGroup extends PackageCore.Component {
		constructor(options?: Self.ToggleGroup.Options);

		buttons: globalThis.Array<Self.ToggleGroup.Button>;

		children: PackageCore.VDom.Children;

		selectedValues: globalThis.Array<Self.ToggleGroup.Value>;

		type: Self.ToggleGroup.Type;

		toggleStrategy: Self.ToggleGroup.ToggleStrategy;

		layout: Self.ToggleGroup.Layout;

		defaultButtonOptions: Self.ToggleGroup.Button;

		onSelectionChanged: (Self.ToggleGroup.SelectionChangedCallback | null);

		select(values: (Self.ToggleGroup.Value | globalThis.Array<Self.ToggleGroup.Value>), options?: {triggerIndex?: (number | null); triggerValue?: any; triggerButton?: (Self.Button | null); reason?: (string | symbol)}): void;

		private parseChildren(children: PackageCore.VDom.Children): globalThis.Array<Self.ToggleGroup.Button>;

		private createButtons(): globalThis.Array<PackageCore.JSX.Element>;

		private handleButtonClick(triggerValue: any, triggerIndex: number): void;

		private checkNumberOfSelectedValues(selectedValuesCount: number): void;

		private focusButton(index: number): void;

		private focusNextButton(): boolean;

		private focusPreviousButton(): boolean;

		private focusFirstButton(): boolean;

		private focusLastButton(): boolean;

		private focusQueryButton(query: PackageCore.Array.FindResult): boolean;

		static singleSelection(toggleGroupOptions: Self.ToggleGroup.Options): Self.ToggleGroup;

		static SingleSelection(props: Self.ToggleGroup.Options): PackageCore.JSX.Element;

		static multiSelection(toggleGroupOptions: Self.ToggleGroup.Options): Self.ToggleGroup;

		static MultiSelection(props: Self.ToggleGroup.Options): PackageCore.JSX.Element;

		static Event: Self.ToggleGroup.EventTypes;

		static Item(props: Self.ToggleGroup.Button): PackageCore.JSX.Element;

	}

	export namespace ToggleGroup {
		interface Button {
			action?: (args: Self.Button.ActionArgs) => void;

			icon?: Self.Image.Source;

			iconPosition?: Self.Button.IconPosition;

			label?: (string | PackageCore.Translation);

			size?: Self.Button.Size;

			value: any;

			badge?: (boolean | string | number | Self.Button.BadgeDefinition);

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTION_CHANGED: string;

		}

		interface ButtonObject {
			button: Self.Button;

			value: any;

		}

		type Value = (string | number | symbol);

		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			buttons?: globalThis.Array<Self.ToggleGroup.Button>;

			defaultButtonOptions?: Self.ToggleGroup.Button;

			layout?: Self.ToggleGroup.Layout;

			selectedValues?: (Self.ToggleGroup.Value | globalThis.Array<Self.ToggleGroup.Value>);

			toggleStrategy?: Self.ToggleGroup.ToggleStrategy;

			type?: Self.ToggleGroup.Type;

			onSelectionChanged?: Self.ToggleGroup.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.ToggleGroup.SelectionChangedArgs, sender: Self.ToggleGroup) => void;

		interface SelectionChangedArgs {
			triggerIndex: (number | null);

			triggerValue: any;

			triggerButton: (Self.Button | null);

			selectedValues: globalThis.Array<Self.ToggleGroup.Value>;

			previousSelectedValues: globalThis.Array<Self.ToggleGroup.Value>;

			reason: Self.ToggleGroup.Reason;

		}

		enum Layout {
			COMPACT,
			LOOSE,
		}

		enum ToggleStrategy {
			ZERO_TO_ONE,
			ALWAYS_ONE,
			ONE_TO_MANY,
			ZERO_TO_MANY,
		}

		enum Type {
			DEFAULT,
			GHOST,
			PURE,
		}

		enum Reason {
			CALL,
			UPDATE,
			USER_SELECTION,
		}

	}

	export class TogglePicker extends Self.Picker {
		constructor(options: object);

		open(args?: object): void;

	}

	export namespace TogglePicker {
	}

	export class ToolBar extends PackageCore.Component {
		constructor(options?: Self.ToolBar.Options);

		components: globalThis.Array<PackageCore.Component>;

		children: PackageCore.VDom.Children;

		focusableItems: globalThis.Array<PackageCore.Component>;

		orientation: Self.ToolBar.Orientation;

		wrap: boolean;

		add(components: (PackageCore.Component | globalThis.Array<PackageCore.Component>), options?: {index?: number; reason?: string}): Self.ToolBar;

		remove(componentOrIndex: (PackageCore.Component | number)): Self.ToolBar;

		clear(): Self.ToolBar;

		has(component: PackageCore.Component): boolean;

		setOrientation(orientation: Self.ToolBar.Orientation): void;

		selectFirstItem(): boolean;

		selectLastItem(): boolean;

		selectNextItem(): boolean;

		selectPreviousItem(): boolean;

		selectItem(item: PackageCore.Component): void;

		static Horizontal(props: Self.ToolBar.Options): PackageCore.JSX.Element;

		static Vertical(props: Self.ToolBar.Options): PackageCore.JSX.Element;

		static Event: Self.ToolBar.EventTypes;

	}

	export namespace ToolBar {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<PackageCore.Component>;

			orientation?: Self.ToolBar.Orientation;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

		}

		enum VisualStyle {
			SMALL,
			MEDIUM,
			LARGE,
			XLARGE,
			PLAIN,
		}

		export import Orientation = Self.ToolBarConstant.Orientation;

		export import Reason = Self.ToolBarConstant.Reason;

		export import Group = Self.ToolBarGroup;

	}

	namespace ToolBarConstant {
		enum Reason {
			CALL,
		}

		enum Orientation {
			VERTICAL,
			HORIZONTAL,
		}

	}

	export class ToolBarGroup extends PackageCore.Component {
		constructor(options?: Self.ToolBarGroup.Options);

		components: globalThis.Array<PackageCore.Component>;

		children: PackageCore.VDom.Children;

		focusableItems: globalThis.Array<PackageCore.Component>;

		add(components: (PackageCore.Component | globalThis.Array<PackageCore.Component>), options?: {index?: number; reason?: string}): Self.ToolBarGroup;

		remove(componentOrIndex: (PackageCore.Component | number)): Self.ToolBarGroup;

		clear(): Self.ToolBarGroup;

		static create(): Self.ToolBarGroup;

		static Event: Self.ToolBarGroup.EventTypes;

	}

	export namespace ToolBarGroup {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			items?: globalThis.Array<PackageCore.Component>;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			ITEM_ADDED: string;

			ITEM_REMOVED: string;

		}

	}

	export class Tooltip implements PackageCore.EventSource {
		on(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		off(eventName: (PackageCore.EventSource.EventName | globalThis.Array<PackageCore.EventSource.EventName> | PackageCore.EventSource.ListenerMap), listener?: PackageCore.EventSource.Listener): void;

		protected _fireEvent(eventName: PackageCore.EventSource.EventName, args?: any): void;

		protected _disposeEvents(): void;

		private _addEventListener(eventName: PackageCore.EventSource.EventName, listener: PackageCore.EventSource.Listener): PackageCore.EventSource.Handle;

		protected _checkDeprecatedEvent(eventName: PackageCore.EventSource.EventName): void;

		constructor(options?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | Self.Tooltip.ContentCallback | Self.Tooltip.Options));

		component: (PackageCore.Component | Element | null);

		content: (PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | Self.Tooltip.ContentCallback | null);

		contentGap: (Self.Tooltip.GapSize | Self.Tooltip.GapSizeObject);

		position: PackageCore.PositionHelper.Options;

		opened: boolean;

		opening: boolean;

		closing: boolean;

		status: PackageCore.Component.Status;

		size: Self.Tooltip.Size;

		attachTo(component: (PackageCore.Component | Element)): void;

		detach(): void;

		setContent(content: (PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | Self.Tooltip.ContentCallback | null)): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

		open(options?: PackageCore.PositionHelper.Options & {component?: (PackageCore.Component | Element); reason?: string}): void;

		close(options?: {reason?: string}): void;

		resize(): void;

		dispose(): void;

		private detachCloseTimer(): void;

		static show(options: Self.Tooltip.Options): void;

		static defaultAlignment: globalThis.Array<PackageCore.PositionHelper.Alignment>;

		static Event: Self.Tooltip.EventTypes;

		static Target(props: {tooltip?: Self.Tooltip; target?: PackageCore.VDomRef}): PackageCore.JSX.Element;

	}

	export namespace Tooltip {
		interface Options extends PackageCore.Component.Options {
			closeStrategy?: Self.Window.CloseStrategyHandler;

			closeTimeout?: number;

			component?: (PackageCore.Component | Element);

			content: (PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | Self.Tooltip.ContentCallback | null);

			contentGap?: (Self.Tooltip.GapSize | Self.Tooltip.GapSizeObject);

			openOnOwnerDisabled?: boolean;

			openStrategy?: (args: object) => boolean;

			position?: (PackageCore.PositionHelper.Options | (() => PackageCore.PositionHelper.Options));

			status?: PackageCore.Component.Status;

			size?: Self.Tooltip.Size;

			visualStyle?: Self.Tooltip.VisualStyle;

			anchorStyle?: Self.Window.AnchorVisualStyleCallback;

			on?: PackageCore.EventSource.ListenerMap;

		}

		type ContentCallback = () => (PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | null);

		interface GapSizeObject {
			top?: Self.Tooltip.GapSize;

			bottom?: Self.Tooltip.GapSize;

			start?: Self.Tooltip.GapSize;

			end?: Self.Tooltip.GapSize;

			horizontal?: Self.Tooltip.GapSize;

			vertical?: Self.Tooltip.GapSize;

		}

		interface EventTypes {
			OPENING: string;

			OPENED: string;

			CLOSING: string;

			CLOSED: string;

		}

		enum Position {
			toCursor,
			toTarget,
			toCursorOrTarget,
		}

		export import Size = Self.Popover.Size;

		export import OpenReason = Self.TooltipOpenReason;

		export import OpenStrategy = Self.TooltipOpenStrategy;

		export import CloseStrategy = Self.WindowCloseStrategy;

		enum VisualStyle {
			TOOLTIP,
			POPOVER,
		}

		export import GapSize = Self.Popover.GapSize;

	}

	export enum TooltipOpenReason {
		CALL,
		FOCUS_IN,
		MOUSE_IN,
		MOUSE_MOVE,
	}

	export namespace TooltipOpenStrategy {
	}

	class Tree extends PackageCore.Component {
		constructor(options?: Self.Tree.Options);

		expandable: boolean;

		expanded: boolean;

		collapsible: boolean;

		showTreeLines: boolean;

		level: number;

		spacing: Self.Tree.HierarchySpacing;

		hierarchy: globalThis.Array<any>;

		static Event: Self.Tree.EventTypes;

	}

	namespace Tree {
		interface Options extends PackageCore.Component.Options {
		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			EXPANDED: string;

		}

		export import HierarchySpacing = Self.TreeConstant.HierarchySpacing;

	}

	export class TreeCell extends Self.GridCell {
		constructor();

		withHierarchy: boolean;

		showTreeLines: boolean;

		hierarchyExpanded: boolean;

		hasDetailRow: boolean;

		detailExpanded: boolean;

		updateHierarchyExpand(): void;

		updateDetailExpand(): void;

		static defaultRenderer(): Self.Text;

	}

	export namespace TreeCell {
	}

	class TreeChildCounter extends PackageCore.Component {
		constructor(options?: Self.TreeChildCounter.Options);

		format: Self.TreeChildCounter.Format;

		showEmpty: boolean;

		visibleCount: number;

		totalCount: number;

	}

	namespace TreeChildCounter {
		interface Options extends PackageCore.Component.Options {
		}

		enum VisualStyle {
			DEFAULT,
		}

		enum Format {
			COUNT_ONLY,
			TOTAL_ONLY,
			COUNT_AND_TOTAL,
			FRACTION,
		}

	}

	export class TreeColumn extends Self.GridColumn {
		constructor(options: Self.TreeColumn.Options);

		showTreeLines: boolean;

		withHierarchy: boolean;

		content: (((args: {cell: Self.TreeCell}) => PackageCore.JSX.Element) | null);

		handleExpanded(value: boolean): void;

	}

	export namespace TreeColumn {
		interface Options extends Self.GridColumn.Options {
			showTreeLines?: boolean;

			withHierarchy?: boolean;

			autoWidth?: boolean;

			content?: Self.TreeColumn.ContentCallback;

		}

		type ContentCallback = (args: Self.TreeColumn.ContentArgs) => (PackageCore.Component | PackageCore.JSX.Element);

		interface ContentArgs {
			cell: Self.TreeCell;

		}

		export import Cell = Self.TreeCell;

	}

	namespace TreeConstant {
		enum HierarchySpacing {
			COMPACT,
			DEFAULT,
		}

		enum SelectionMode {
			INDEPENDENT,
			GROUP,
		}

		enum DropPosition {
			BEFORE,
			AFTER,
			INSIDE,
		}

		enum Reason {
			CURSOR_SET,
			SELECT,
			UNSELECT,
			MULTI_SELECT_DISABLED,
			SELECTABLE_DISABLED,
			DATA_LOADED,
			DATA_REMOVED,
			DATA_MOVED,
			DATA_RESET,
			DATA_BIND,
			DATA_UNBIND,
			CLICK,
			KEY_DOWN,
			CHECK_UPDATE,
		}

	}

	export namespace TreeDataExchange {
		function dragSource(options: object): PackageCore.DataExchange.DragSourceProvider;

		function dragTarget(options: object): PackageCore.DataExchange.DragTargetProvider;

	}

	export class TreeItem extends PackageCore.Component {
		constructor();

		treeView: Self.TreeView;

		parentItem: Self.TreeItem;

		childItems: globalThis.Array<Self.TreeItem>;

		visibleChildItems: globalThis.Array<Self.TreeItem>;

		childCount: number;

		visibleChildCount: number;

		empty: boolean;

		visibleEmpty: boolean;

		index: number;

		flatVisibleIndex: number;

		indexPath: Self.ListBox.IndexPath;

		level: number;

		dataEntry: object;

		dataItem: any;

		dataBound: boolean;

		loaded: boolean;

		loading: boolean;

		height: number;

		userData: object;

		renderData: (object | null);

		label: string;

		selectable: boolean;

		effectiveSelectable: boolean;

		draggable: boolean;

		effectiveDraggable: boolean;

		selected: boolean;

		effectiveVisible: boolean;

		filtered: boolean;

		expanded: boolean;

		expandable: boolean;

		collapsible: boolean;

		virtualization: boolean;

		content: (PackageCore.Component | null);

		contentProvider: (item: Self.TreeItem, renderData: object) => PackageCore.JSX.Element;

		totalChildCount: number;

		totalVisibleChildCount: number;

		childCounter: (object | null);

		actionControls: (PackageCore.Component | PackageCore.JSX.Element | globalThis.Array<(PackageCore.Component | PackageCore.JSX.Element)> | null);

		checkValue: (boolean | null);

		dropIndicator: Self.TreeItem.DropPosition;

		addItems(items: globalThis.Array<Self.TreeItem>, options: {index: number; reason?: string}): void;

		removeItems(index: number, count: number, options: {reason?: string}): void;

		bind(entry: PackageCore.DataStoreEntry): void;

		unbind(): void;

		load(): globalThis.Promise<any>;

		loadAll(): globalThis.Promise<any>;

		expand(): void;

		expandAll(): globalThis.Promise<any>;

		expandParents(): void;

		collapse(): void;

		collapseAll(): void;

		collapseParents(): void;

		refresh(): void;

		containsItem(item: Self.TreeItem): boolean;

		getCommonParent(item: Self.TreeItem): void;

		setSelectable(value: boolean, options?: {reason?: string}): void;

		setSelected(value: boolean, options?: {reason?: string}): void;

		setCursor(value: boolean): void;

		setCursorVisible(value: boolean): void;

		setExpanded(value: boolean, options?: {reason?: string}): void;

		setCollapsible(value: boolean): void;

		setDraggable(value: boolean, options?: {reason?: string}): void;

		setHeight(value: number, options?: {reason?: string}): void;

		setChildCounter(counter: (PackageCore.Component | null)): void;

		setActionControls(controls: (PackageCore.Component | globalThis.Array<PackageCore.Component> | null)): void;

		setDropIndicator(value: Self.TreeItem.DropPosition): void;

		visit(callback: (item: Self.TreeItem) => boolean, self?: boolean): void;

		visitVisible(callback: (item: Self.TreeItem) => (boolean | null), self?: boolean): void;

		setupVirtualPosition(): void;

		countMatchingItems(visible: boolean, predicate?: (item: Self.TreeItem) => boolean): number;

		getFirstItem(onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getLastItem(onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getNextItem(from?: Self.TreeItem, onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getPreviousItem(from?: Self.TreeItem, onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		static defaultContent(item: Self.TreeItem): PackageCore.JSX.Element;

		static Event: Self.TreeItem.EventTypes;

	}

	export namespace TreeItem {
		interface Options extends PackageCore.Component.Options {
			treeView: Self.TreeView;

			parentItem: Self.TreeItem;

			index: number;

			level: number;

			dataEntry?: PackageCore.DataStoreEntry;

			height: number;

			content: (item: Self.TreeItem, renderData: object) => PackageCore.JSX.Element;

			childCounter?: Self.TreeChildCounter.Options;

			selected?: boolean;

			expanded?: boolean;

			collapsible?: boolean;

		}

		interface EventTypes extends PackageCore.Component.EventTypes {
			SELECTED: string;

			SELECTABLE_CHANGED: string;

			EFFECTIVE_SELECTABLE_CHANGED: string;

			DRAGGABLE_CHANGED: string;

			EFFECTIVE_DRAGGABLE_CHANGED: string;

			VISIBLE_CHANGED: string;

			EFFECTIVE_VISIBLE_CHANGED: string;

			HEIGHT_CHANGED: string;

			ITEMS_ADDED: string;

			ITEMS_REMOVED: string;

			EXPANDED: string;

			LOADING_STARTED: string;

			LOADING_FINISHED: string;

			VISIBLE_CHILDREN_CHANGED: string;

		}

		enum VisualStyle {
			DEFAULT,
		}

		export import DropPosition = Self.TreeConstant.DropPosition;

	}

	export class TreeView extends Self.DataSourceComponent {
		constructor(options?: Self.TreeView.Options);

		selectedItems: globalThis.Array<any>;

		selectedTreeItems: globalThis.Array<Self.TreeItem>;

		selectedIndexPaths: globalThis.Array<Self.TreeView.IndexPath>;

		selectable: boolean;

		draggable: boolean;

		multiSelect: boolean;

		lockedLevels: number;

		displayMember: (Self.DataSourceComponent.DisplayMember | null);

		cursorItem: Self.TreeItem;

		cursorVisibility: Self.TreeView.CursorVisibility;

		initialCursorPosition: Self.TreeView.InitialCursorPosition;

		moveSelectionWithCursor: boolean;

		rootItem: Self.TreeItem;

		items: globalThis.Array<Self.TreeItem>;

		visibleItems: globalThis.Array<Self.TreeItem>;

		empty: boolean;

		visibleEmpty: boolean;

		placeholder: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

		virtualization: boolean;

		showTreeLines: boolean;

		showItemLoaders: boolean;

		clickToExpand: boolean;

		clickToSelect: boolean;

		hierarchySpacing: Self.TreeView.HierarchySpacing;

		totalItemCount: number;

		totalVisibleItemCount: number;

		preload: Self.TreeView.Preload;

		withChecks: boolean;

		withBorder: boolean;

		selectionMode: Self.TreeView.SelectionMode;

		itemContent: (((item: Self.TreeItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element)) | null);

		onSelectionChanged: (Self.TreeView.SelectionChangedCallback | null);

		select(options: {items?: globalThis.Array<any>; treeItems?: globalThis.Array<Self.TreeItem>; indexPaths?: globalThis.Array<any>; predicate?: (item: Self.TreeItem) => boolean; append?: boolean; reason?: string}): boolean;

		unselect(options: {items?: globalThis.Array<any>; treeItems?: globalThis.Array<Self.TreeItem>; indexPaths?: globalThis.Array<any>; predicate?: (item: Self.TreeItem) => boolean; reason?: string}): boolean;

		selectAll(options?: {reason?: string}): boolean;

		selectAllVisible(options?: {reason?: string}): boolean;

		unselectAll(options?: {reason?: string}): boolean;

		selectGroup(root: Self.TreeItem, reason?: string): void;

		unselectGroup(root: Self.TreeItem, reason?: string): void;

		toggleGroup(item: Self.TreeItem, reason?: string): void;

		toggleItem(item: Self.TreeItem, reason?: string): void;

		filter(predicate: (item: Self.TreeItem) => boolean): void;

		itemAtIndexPath(indexPath: Self.TreeView.IndexPath): (Self.TreeItem | null);

		itemForElement(element: Element): (Self.TreeItem | null);

		itemForDataItem(dataItem: any): (Self.TreeItem | null);

		scrollTo(args: {treeItem?: Self.TreeItem; item?: any; indexPath?: Self.TreeView.IndexPath; reason?: string}): void;

		scrollToSelection(): void;

		setSelectable(value: boolean): void;

		setDraggable(value: boolean): void;

		setMultiSelect(value: boolean): void;

		setVirtualization(value: boolean): void;

		setCursorItem(item: (Self.TreeItem | null), options?: {reason?: string}): void;

		setCursorVisibility(cursorVisibility: Self.TreeView.CursorVisibility): void;

		setMoveSelectionWithCursor(value: boolean): void;

		setPlaceholder(value: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element)): void;

		setPreload(value: Self.TreeView.Preload): void;

		setShowItemLoaders(value: boolean): void;

		getFirstItem(onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getLastItem(onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getNextItem(from: Self.TreeItem, onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		getPreviousItem(from: Self.TreeItem, onlyVisible?: boolean, predicate?: (item: Self.TreeItem) => boolean): (Self.TreeItem | null);

		visit(callback: (item: Self.TreeItem) => boolean): void;

		visitVisible(callback: (item: Self.TreeItem) => boolean): void;

		countMatchingItems(visible: boolean, predicate?: (item: Self.TreeItem) => boolean): number;

		expandAll(): globalThis.Promise<any>;

		expandPath(selector: (level: number, items: globalThis.Array<Self.TreeItem>) => Self.TreeItem): globalThis.Promise<any>;

		expandPathToDataItem(dataItem: any): globalThis.Promise<any>;

		expandIndexPath(indexPath: Self.TreeView.IndexPath): globalThis.Promise<any>;

		collapseAll(): void;

		collapsePath(selector: (level: number, items: globalThis.Array<Self.TreeItem>) => Self.TreeItem): void;

		collapseIndexPath(indexPath: Self.TreeView.IndexPath): void;

		loadAll(): globalThis.Promise<any>;

		loadPath(selector: (level: number, items: globalThis.Array<Self.TreeItem>) => Self.TreeItem): globalThis.Promise<any>;

		loadIndexPath(indexPath: Self.TreeView.IndexPath): globalThis.Promise<any>;

		static defaultItemContent(): PackageCore.JSX.Element;

		static Event: Self.TreeView.EventTypes;

	}

	export namespace TreeView {
		type IndexPath = globalThis.Array<number>;

		interface Options extends Self.DataSourceComponent.Options {
			childCounter?: (boolean | object | ((dataItem: any) => Self.TreeChildCounter.Options));

			clickToExpand?: boolean;

			clickToSelect?: boolean;

			cursorVisibility?: Self.TreeView.CursorVisibility;

			customizeItem?: Self.TreeView.CustomizeItemCallback;

			displayMember?: Self.DataSourceComponent.DisplayMember;

			draggable?: boolean;

			hierarchySpacing?: Self.TreeView.HierarchySpacing;

			initialCursorPosition?: Self.TreeView.InitialCursorPosition;

			itemContent?: (item: Self.TreeItem, renderData: object) => (PackageCore.Component | PackageCore.JSX.Element);

			itemDragSource?: PackageCore.DataExchange.DragSourceProvider;

			itemHeight?: number;

			itemLoader?: object;

			itemReorder?: boolean;

			keepSelection?: boolean;

			lockedLevels?: number;

			moveSelectionWithCursor?: boolean;

			multiSelect?: boolean;

			placeholder?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			preload?: Self.TreeView.Preload;

			selectable?: boolean;

			selectedItems?: globalThis.Array<any>;

			selectionMode?: Self.TreeView.SelectionMode;

			showItemLoaders?: boolean;

			showTreeLines?: boolean;

			stickyGroupHeaders?: boolean;

			virtualization?: boolean;

			withChecks?: boolean;

			expanded?: boolean;

			onSelectionChanged?: Self.TreeView.SelectionChangedCallback;

		}

		type SelectionChangedCallback = (args: Self.TreeView.SelectionChangedArgs, sender: Self.TreeView) => void;

		type CustomizeItemCallback = (item: Self.TreeItem) => void;

		interface SelectionChangedArgs {
			items: globalThis.Array<any>;

			previousItems: globalThis.Array<any>;

			addedItems: globalThis.Array<any>;

			removedItems: globalThis.Array<any>;

			reason: Self.TreeView.Reason;

		}

		interface EventTypes extends Self.DataSourceComponent.EventTypes {
			SELECTION_CHANGED: string;

			CURSOR_MOVED: string;

			ITEMS_ADDED: string;

			ITEMS_REMOVED: string;

			ITEM_EXPANDED: string;

			ITEM_LOADING_STARTED: string;

			ITEM_LOADING_FINISHED: string;

		}

		enum VisualStyle {
			DEFAULT,
			EMBEDDED,
		}

		export import DataExchange = Self.TreeDataExchange;

		export import Item = Self.TreeItem;

		export import ItemVisualStyle = Self.TreeItem.VisualStyle;

		enum Reason {
		}

		enum InitialCursorPosition {
			NONE,
			FIRST,
			FIRST_SELECTED,
		}

		enum CursorVisibility {
			FOCUS,
			ALWAYS,
		}

		enum Preload {
			NONE,
			VISIBLE,
			ALL,
		}

		export import HierarchySpacing = Self.TreeConstant.HierarchySpacing;

		export import SelectionMode = Self.TreeConstant.SelectionMode;

		export import CounterFormat = Self.TreeChildCounter.Format;

	}

	namespace UifBundle {
	}

	class VirtualListView extends PackageCore.Component {
		constructor();

		stickyGroupHeaders: boolean;

		scrollTo(item: object): void;

		static Event: Self.VirtualListView.EventTypes;

	}

	namespace VirtualListView {
		interface EventTypes extends PackageCore.Component.EventTypes {
			SCROLL_TO_END: string;

		}

	}

	class VirtualTreeContainer extends PackageCore.Component {
		constructor();

	}

	namespace VirtualTreeContainer {
	}

	export enum VisualizationColor {
		NEUTRAL,
		SUCCESS,
		WARNING,
		DANGER,
		INFO,
		TEAL,
		ORANGE,
		TURQUOISE,
		TAUPE,
		GREEN,
		PINK,
		BROWN,
		LILAC,
		YELLOW,
		PURPLE,
		BLUE,
		PINE,
	}

	export abstract class Window extends PackageCore.Component implements PackageCore.Portal {
		protected constructor(options: Self.Window.Options);

		content: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element | null);

		contentGap: (Self.Window.GapSize | Self.Window.GapSizeObject);

		buttons: (globalThis.Array<Self.Button> | PackageCore.Component | null);

		buttonsJustification: Self.Window.ButtonsJustification;

		icon: (Self.Image.Source | null);

		label: (string | PackageCore.Translation | PackageCore.Component | null);

		footerContent: (string | PackageCore.Translation | PackageCore.Component | null);

		parentWindow: (Self.Window | null);

		owner: (PackageCore.Component | PackageCore.VDomRef | Element);

		childWindows: globalThis.Array<Self.Window>;

		level: number;

		layer: number;

		opened: boolean;

		opening: boolean;

		closing: boolean;

		modal: boolean;

		state: Self.Window.State;

		resizable: boolean;

		pointerEvents: boolean;

		open(options?: Self.Window.OpenArgs): void;

		close(options?: object): void;

		maximize(options?: {reason?: string}): void;

		restore(options?: {reason?: string}): void;

		setContent(content: (PackageCore.Component | string | PackageCore.Translation | PackageCore.JSX.Element | null)): void;

		setState(state: Self.Window.State, options?: {reason?: string}): void;

		resize(options?: object): void;

		position(options?: (Self.Window.PositionArgs | null), updateSize?: boolean): void;

		private setRootElementStyle(position: PackageCore.Rectangle): void;

		private alignToDocumentBody(coordinates: PackageCore.PositionHelper.FrameDescription): PackageCore.Rectangle;

		private getPositionOptions(options: PackageCore.PositionHelper.Options, measuredSize: object): PackageCore.PositionHelper.Options;

		static findManagingWindow(): void;

		static defaultFocusHandler(): void;

		static Event: Self.Window.EventTypes;

	}

	export namespace Window {
		interface Options extends PackageCore.Component.Options {
			allowClip?: boolean;

			autoResize?: boolean;

			buttons?: (globalThis.Array<Self.Button> | PackageCore.Component);

			buttonsJustification?: Self.Window.ButtonsJustification;

			closeStrategy?: Self.Window.CloseStrategyHandler;

			content?: (string | PackageCore.Translation | PackageCore.Component | PackageCore.JSX.Element);

			contentGap?: (Self.Window.GapSize | Self.Window.GapSizeObject);

			footerContent?: (string | PackageCore.Translation | PackageCore.Component);

			getFocusComponent?: (body: Self.WindowBody, focusManager: PackageCore.FocusManager) => (Element | PackageCore.Component);

			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation | PackageCore.Component);

			modal?: boolean;

			owner: (PackageCore.Component | PackageCore.VDomRef | Element);

			position?: Self.Window.PositionArgs;

			resizable?: boolean;

			role?: Self.Window.Role;

			tabbable?: boolean;

			withAnchor?: boolean;

			anchorStyle?: Self.Window.AnchorVisualStyleCallback;

			pointerEvents?: boolean;

		}

		interface OpenArgs {
			closeStrategy?: Self.Window.CloseStrategyHandler;

			position?: Self.Window.PositionArgs;

			reason?: string;

		}

		type Target = (PackageCore.VDomRef | PackageCore.Component | Element | string | PackageCore.PositionHelper.Point | PackageCore.Rectangle | PackageCore.PositionHelper.TargetPoint);

		interface PositionArgs {
			alignment?: (PackageCore.PositionHelper.Alignment | globalThis.Array<PackageCore.PositionHelper.Alignment>);

			alignmentOffset?: number;

			allowed?: (PackageCore.PositionHelper.Placement | globalThis.Array<PackageCore.PositionHelper.Placement>);

			allowOverlapOuterContainer?: boolean;

			outerContainer?: (HTMLElement | PackageCore.Rectangle);

			placement?: (PackageCore.PositionHelper.Placement | globalThis.Array<PackageCore.PositionHelper.Placement>);

			placementOffset?: number;

			rtl?: boolean;

			size?: PackageCore.PositionHelper.SizeOptions;

			strategy?: PackageCore.PositionHelper.Strategy;

			target?: Self.Window.Target;

		}

		interface GapSizeObject {
			top?: Self.Window.GapSize;

			bottom?: Self.Window.GapSize;

			start?: Self.Window.GapSize;

			end?: Self.Window.GapSize;

			horizontal?: Self.Window.GapSize;

			vertical?: Self.Window.GapSize;

		}

		type AnchorVisualStyleCallback = (theme: PackageCore.Theme) => PackageCore.Style;

		type CloseStrategyHandler = (window: Self.Window) => PackageCore.RoutedMessage.Filter;

		interface EventTypes extends PackageCore.Component.EventTypes {
			OPENING: string;

			OPENED: string;

			CLOSING: string;

			CLOSED: string;

			MOVED: string;

			USER_RESIZING: string;

			USER_RESIZED: string;

			STATE_CHANGED: string;

		}

		enum VisualStyle {
			MODAL,
			POPOVER,
			PICKER,
			TOOLTIP,
		}

		enum State {
			FLOATING,
			MAXIMIZED,
		}

		enum Role {
			CONTEXT_MENU,
			POPOVER,
			MODAL,
			TOOLTIP,
		}

		export import CloseReason = Self.WindowCloseReason;

		export import CloseStrategy = Self.WindowCloseStrategy;

		export import ButtonsJustification = Self.WindowBody.ButtonsJustification;

		export import GapSize = Self.GapSize;

		export import Position = PackageCore.PositionHelper;

		enum defaultPopupOptions {
			autoResize,
			focusOnOpen,
			withTitleBar,
			resizable,
			closeStrategy,
			role,
			visualStyle,
		}

	}

	class WindowBody extends PackageCore.Component {
		constructor(options?: Self.WindowBody.Options);

		label: (string | PackageCore.Translation | PackageCore.Component | null);

		icon: (Self.Image.Source | null);

		children: (string | PackageCore.Translation | PackageCore.Component);

		buttons: (globalThis.Array<Self.Button> | PackageCore.Component);

		buttonsJustification: Self.Window.ButtonsJustification;

		footerContent: (string | PackageCore.Translation | PackageCore.Component | null);

		contentGap: (Self.Window.GapSize | Self.Window.GapSizeObject);

		hasLabel: boolean;

		hasIcon: boolean;

		hasFooter: boolean;

	}

	namespace WindowBody {
		interface Options extends PackageCore.Component.Options {
			children?: PackageCore.VDom.Children;

			content?: (string | PackageCore.Translation | PackageCore.Component);

			icon?: Self.Image.Source;

			label?: (string | PackageCore.Translation | PackageCore.Component);

			buttons?: (globalThis.Array<Self.Button> | PackageCore.Component);

			buttonsJustification?: Self.Window.ButtonsJustification;

			footerContent?: (string | PackageCore.Translation | PackageCore.Component);

			contentGap?: (Self.Window.GapSize | Self.Window.GapSizeObject);

		}

		enum ButtonsJustification {
			START,
			END,
			CENTER,
		}

	}

	export enum WindowCloseReason {
		CALL,
		FOCUSED,
		FOCUS_IN,
		FOCUS_OUT,
		ACTIVATED,
		ENTER,
		ESCAPE,
		SPACE,
		KEY,
		MOUSE_MOVE,
		MOUSE_LEAVE,
		CLICK,
		TOUCH,
		SCROLL,
		PARENT_CLOSED,
		CLOSE_BUTTON,
		DISPOSED,
		ITEM_ACTION,
		TIMEOUT,
		OK_BUTTON,
		CANCEL_BUTTON,
	}

	export class WindowCloseStrategy {
		static DEFAULT_MOUSE_DELAY: number;

		static focusOutside(component: (PackageCore.Component | null), options: (object | null)): Self.Window.CloseStrategyHandler;

		static mouseOutside(component: (PackageCore.Component | null), options: (object | null)): Self.Window.CloseStrategyHandler;

		static clickOutside(component: (PackageCore.Component | null), options: (object | null)): Self.Window.CloseStrategyHandler;

		static scrollOutside(component: (PackageCore.Component | null), options: (object | null)): Self.Window.CloseStrategyHandler;

		static key(key: PackageCore.KeyCode, options: (object | null)): Self.Window.CloseStrategyHandler;

		static escape(): Self.Window.CloseStrategyHandler;

		static none(): Self.Window.CloseStrategyHandler;

		static anyOf(strategies: globalThis.Array<Self.Window.CloseStrategyHandler>): Self.Window.CloseStrategyHandler;

		static custom(options: object): Self.Window.CloseStrategyHandler;

		static default(options: object): Self.Window.CloseStrategyHandler;

		static popover(component?: PackageCore.Component, options?: object): Self.Window.CloseStrategyHandler;

		static focusedOrOver(component: (PackageCore.Component | null), options?: object): Self.Window.CloseStrategyHandler;

	}

	export namespace WindowCloseStrategy {
	}

	class WindowDragger {
		constructor(options?: object);

		attach(): void;

		detach(): void;

		processMessage(next: PackageCore.RoutedMessage.Handler, message: PackageCore.RoutedMessage, result: PackageCore.RoutedMessage.Result): void;

	}

	namespace WindowDragger {
	}

	export class WindowTitleBar extends PackageCore.Component {
		constructor(options?: Self.WindowTitleBar.Options);

		title: (string | number | PackageCore.Translation);

		maximizeButton: boolean;

		closeButton: boolean;

		icon: Self.Image.Source;

		draggable: boolean;

		onButton: Self.WindowTitleBar.ButtonCallback;

		onMove: Self.WindowTitleBar.MoveCallback;

	}

	export namespace WindowTitleBar {
		interface Options extends PackageCore.Component.Options {
			title?: (string | number | PackageCore.Translation);

			icon?: Self.Image.Source;

			maximizeButton?: boolean;

			closeButton?: boolean;

			draggable?: boolean;

			onButton?: Self.WindowTitleBar.ButtonCallback;

			onMove?: Self.WindowTitleBar.MoveCallback;

		}

		type ButtonCallback = (args: Self.WindowTitleBar.ButtonCallbackArgs) => void;

		interface ButtonCallbackArgs {
			button: Self.WindowTitleBar.Button;

		}

		type MoveCallback = (coordinates: PackageCore.PointerMessage.Coordinates) => void;

		enum VisualStyle {
			DEFAULT,
		}

		enum Button {
			MINIMIZE,
			MAXIMIZE,
			CLOSE,
		}

	}

	export function createActionColumn(columnOptions: Omit<Self.ActionColumn.Options, "type">): Self.ActionColumn.Options;

	export function createTemplatedColumn(columnOptions: Omit<Self.TemplatedColumn.Options, "type">): Self.TemplatedColumn.Options;

}
