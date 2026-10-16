package tracesstatementbuilder

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSettingsClause(t *testing.T) {
	testCases := []struct {
		name       string
		configured uint64
		want       string
	}{
		{
			name:       "Unset_UsesDefault",
			configured: 0,
			want:       " SETTINGS distributed_product_mode='allow', max_memory_usage=10000000000",
		},
		{
			name:       "Configured_UsesConfiguredValue",
			configured: 32_000_000_000,
			want:       " SETTINGS distributed_product_mode='allow', max_memory_usage=32000000000",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			assert.Equal(t, testCase.want, SettingsClause(MaxMemoryUsageOrDefault(testCase.configured)))
		})
	}
}
