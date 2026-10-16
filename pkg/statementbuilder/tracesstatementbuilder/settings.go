package tracesstatementbuilder

import "fmt"

// DefaultMaxMemoryUsage is the max_memory_usage trace queries use when none is configured.
const DefaultMaxMemoryUsage uint64 = 10_000_000_000

// MaxMemoryUsageOrDefault returns configured, or DefaultMaxMemoryUsage when it is 0.
func MaxMemoryUsageOrDefault(configured uint64) uint64 {
	if configured == 0 {
		return DefaultMaxMemoryUsage
	}
	return configured
}

// SettingsClause is the SETTINGS clause appended to trace queries.
func SettingsClause(maxMemoryUsage uint64) string {
	return fmt.Sprintf(" SETTINGS distributed_product_mode='allow', max_memory_usage=%d", maxMemoryUsage)
}
