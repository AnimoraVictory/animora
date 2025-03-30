//go:build tools
// +build tools

package tools

// 以下のインポートは、go.mod に依存関係を残すためだけに行います。
import (
	_ "github.com/olekukonko/tablewriter"
)
