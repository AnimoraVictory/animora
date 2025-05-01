package infra

import "github.com/aws/aws-sdk-go/service/ses"

type MailerRepository struct {
	ses *ses.SES
}

func NewMailerRepository(ses *ses.SES) *MailerRepository {
	return &MailerRepository{
		ses: ses,
	}
}

func (s *MailerRepository) Send(email *ses.SendEmailInput) (*ses.SendEmailOutput, error) {
	return s.ses.SendEmail(email)
}
