package handler

import (
	"fmt"
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
)

type ReportHandler struct {
	reportUsecase *usecase.ReportUsecase
}

func NewReportHandler(reportUsecase usecase.ReportUsecase) *ReportHandler {
	return &ReportHandler{
		reportUsecase: &reportUsecase,
	}
}

type SendReportRequest struct {
	PostID string `json:"postId"`
	UserID string `json:"userId"`
	Reason string `json:"reason"`
}

func (h *ReportHandler) SendReport(c echo.Context) error {
	var req SendReportRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	from := "aki.kaku0627@gmail.com"
	to := "aki.kaku0627@gmail.com"
	subject := "【通報】ユーザーからの通報がありました"
	body := fmt.Sprintf("Post ID: %s\nUser ID: %s\nReason: %s", req.PostID, req.UserID, req.Reason)

	if _, err := h.reportUsecase.SendReport(from, to, subject, body); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to send report email")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Report sent successfully"})
}
