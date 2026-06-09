package app

import (
	"github.com/absalipande/relay/internal/config"
	"github.com/absalipande/relay/internal/id"
	"github.com/thecodearcher/limen"
	gormadapter "github.com/thecodearcher/limen/adapters/gorm"
	credentialpassword "github.com/thecodearcher/limen/plugins/credential-password"
	"gorm.io/gorm"
)

func NewAuth(db *gorm.DB, cfg config.Config) (*limen.Limen, error) {
	return limen.New(&limen.Config{
		BaseURL:  cfg.BaseURL,
		Database: gormadapter.New(db),
		Secret:   []byte(cfg.LimenSecret),
		Schema: limen.NewDefaultSchemaConfig(
			limen.WithSchemaIDGenerator(id.NewUUIDGenerator()),
		),
		CLI: &limen.CLIConfig{
			Enabled: cfg.AppEnv != "production",
		},
		HTTP: limen.NewDefaultHTTPConfig(
			limen.WithHTTPCookieSecure(cfg.AppEnv == "production"),
		),
		Plugins: []limen.Plugin{
			credentialpassword.New(),
		},
	})
}
