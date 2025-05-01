package usecase

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/ses"
)

type ReportUsecase struct {
	mailerRepository repository.MailerRepository
}

func NewReportUsecase(mailerRepository repository.MailerRepository) *ReportUsecase {
	return &ReportUsecase{
		mailerRepository: mailerRepository,
	}
}

func (u *ReportUsecase) SendReport(from, to, subject, body string) (*ses.SendEmailOutput, error) {
	email := &ses.SendEmailInput{
		Source: aws.String(from),
		Destination: &ses.Destination{
			ToAddresses: []*string{aws.String(to)},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Data: aws.String(body),
				},
			},
			Subject: &ses.Content{
				Data: aws.String(subject),
			},
		},
	}
	return u.mailerRepository.Send(email)
}
