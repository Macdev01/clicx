package services

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
)

type InvoiceRequest struct {
	OrderName   string `json:"order_name"`
	Amount      string `json:"amount"`
	Currency    string `json:"currency"`
	OrderNumber string `json:"order_number"`
	CallbackURL string `json:"callback_url"`
}

type InvoiceResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		TxnID      string `json:"txn_id"`
		InvoiceURL string `json:"invoice_url"`
	} `json:"data"`
}

type PlisioClient struct {
	ApiKey string
}

func NewPlisioClient() *PlisioClient {
	return &PlisioClient{
		ApiKey: os.Getenv("PLISIO_API_KEY"),
	}
}

func (pc *PlisioClient) CreateInvoice(req InvoiceRequest) (*InvoiceResponse, error) {
	url := fmt.Sprintf("https://plisio.net/api/v1/invoices?api_key=%s", pc.ApiKey)

	body, _ := json.Marshal(req)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var invoiceResp InvoiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&invoiceResp); err != nil {
		return nil, err
	}

	if invoiceResp.Status != "success" {
		return nil, fmt.Errorf("Plisio error: %s", invoiceResp.Message)
	}

	return &invoiceResp, nil
}

func ValidatePlisioSignature(params map[string]string) bool {
	secretKey := os.Getenv("PLISIO_SECRET_KEY")
	if secretKey == "" {
		return false
	}

	hash := params["hash"]
	delete(params, "hash")

	// Сортировка ключей и сбор строки
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var sb strings.Builder
	for _, k := range keys {
		sb.WriteString(k + "=" + params[k] + "|")
	}
	sb.WriteString(secretKey)

	checksum := md5.Sum([]byte(sb.String()))
	expected := hex.EncodeToString(checksum[:])

	return strings.EqualFold(hash, expected)
}
