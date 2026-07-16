export const CLAUDE_MANIFEST_PATH = '.claude-plugin/plugin.json';
export const CODEX_MANIFEST_PATH = '.codex-plugin/plugin.json';

export const GENERATED_MANIFEST_PATHS = new Set([
	CLAUDE_MANIFEST_PATH,
	CODEX_MANIFEST_PATH,
]);

export const FRONTMATTER_REQUIRED_FIELDS = ['name', 'description', 'license'];
