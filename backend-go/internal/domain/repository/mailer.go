package repository

import "github.com/aws/aws-sdk-go/service/ses"

type MailerRepository interface {
	Send(email *ses.SendEmailInput) (*ses.SendEmailOutput, error)
}
