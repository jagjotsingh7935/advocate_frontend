import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
  Alert,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Fade,
  Divider,
  Stack,
  Grid,
} from "@mui/material";
import {
  Send,
  Schedule,
  CheckCircle,
  Error,
  Visibility,
  Search,
  FilterList,
  Upload,
  CalendarToday,
  AccessTime,
  Phone,
  Person,
  Message,
  Close,
  Refresh,
} from "@mui/icons-material";
import axios from "axios";
import debounce from "lodash.debounce";
import { sendWhatsAppReminders } from "../api/TaxReminderApi";
import useMyContext from "../usercontext/useMyContext";
import { getTaxReminder, WhatsappTemplateType } from "../api/Api";

// import { DatePicker, TimePicker } from "@mui/x-date-pickers";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TaxReminderMessages = () => {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);

  const [templateType, setTemplateType] = useState(null); // For selected template type
  const [templateTypes, setTemplateTypes] = useState([]); // For available template types
  const [templatePreview, setTemplatePreview] = useState(""); // For template preview
  const [loadingTemplate, setLoadingTemplate] = useState(false); // For template loading state

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    num_pages: 1,
    page_size: 5,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { theme } = useMyContext();

  // Define theme-based colors
  const themeColors = {
    textPrimary: theme === "dark" ? "white" : "#012345",
    textSecondary:
      theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
    background: theme === "dark" ? "#0D0C0F" : "white",
    border: theme === "dark" ? "#4a5fa5" : "#e0e0e0",
    tableHeaderBg: theme === "dark" ? "#0D0C0F" : "#f8f9fa",
    chipBg:
      theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.02)",
    hoverBg:
      theme === "dark" ? "rgba(74, 95, 165, 0.2)" : "rgba(74, 95, 165, 0.05)",
    primary: "#4a5fa5",
    primaryHover: theme === "dark" ? "#5c70b8" : "#3d5194",
    error: "#f44336",
    errorBg:
      theme === "dark" ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.05)",
    disabled:
      theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.26)",
  };

  // Create an axios instance with timeout
  // const axiosInstance = axios.create({
  //   timeout: 15000, // 15 seconds timeout
  // });

  // Debounced search function
  // const debouncedFetchMessages = useCallback(
  //   debounce(async (searchValue, status, pageNum, pageSize) => {
  //     setLoading(true);
  //     try {
  //       const response = await axiosInstance.get('http://127.0.0.1:8000/tax-reminder-messages/', {
  //         params: {
  //           page: pageNum + 1,
  //           page_size: pageSize,
  //           search: searchValue || undefined,
  //           status: status || undefined,
  //         },
  //       });

  //       setMessages(response.data.results || []);
  //       setPagination({
  //         count: response.data.count || 0,
  //         num_pages: response.data.num_pages || 1,
  //         page_size: response.data.page_size || 5,
  //       });
  //       setError(null);
  //     } catch (err) {
  //       setMessages([]);
  //       setPagination({ count: 0, num_pages: 1, page_size: 5 });
  //       setError(err.response?.data?.error || 'Failed to fetch messages. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, 500), // 500ms debounce delay
  //   []
  // );

  const debouncedFetchMessages = useCallback(
    debounce(async (searchValue, status, pageNum, pageSize) => {
      setLoading(true);
      try {
        const response = await getTaxReminder({
          page: pageNum + 1,
          page_size: pageSize,
          search: searchValue || undefined,
          status: status || undefined,
        });

        setMessages(response.results || []);
        setPagination({
          count: response.count || 0,
          num_pages: response.num_pages || 1,
          page_size: response.page_size || 5,
        });
        setError(null);
      } catch (err) {
        setMessages([]);
        setPagination({ count: 0, num_pages: 1, page_size: 5 });
        setError(err.error || "Failed to fetch messages. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 500),
    [],
  );

  // Fetch messages when dependencies change
  useEffect(() => {
    debouncedFetchMessages(search, statusFilter, page, rowsPerPage);
    return () => debouncedFetchMessages.cancel();
  }, [search, statusFilter, page, rowsPerPage, debouncedFetchMessages]);

  // Sync time string with selectedTime when component mounts or time changes from outside
  useEffect(() => {
    if (time) {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      setSelectedTime(date);
    } else {
      setSelectedTime(null);
    }
  }, [time]);

  // Handle time change
  const handleTimeChange = (date) => {
    if (date && !isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const newTime = `${hours}:${minutes}`;
      setTime(newTime);
      setSelectedTime(date);
    } else {
      setTime("");
      setSelectedTime(null);
    }
  };

  // Fetch WhatsApp message template types
  useEffect(() => {
    const fetchTemplateTypes = async () => {
      try {
        const response = await WhatsappTemplateType();
        setTemplateTypes(
          response.map((item) => ({
            id: item.id,
            label: item.type,
            description: item.description,
            template: item.template, // Store template content for preview
          })),
        );
      } catch (error) {
        console.error("Error fetching template types:", error);
        setError("Failed to load message templates");
      }
    };
    fetchTemplateTypes();
  }, []);

  // Update template preview when template type changes
  useEffect(() => {
    if (templateType) {
      setLoadingTemplate(true);
      // Find the selected template and set its preview
      const selectedTemplate = templateTypes.find(
        (t) => t.id === templateType.id,
      );
      if (selectedTemplate && selectedTemplate.template) {
        setTemplatePreview(selectedTemplate.template);
      } else {
        setTemplatePreview("");
      }
      setLoadingTemplate(false);
    } else {
      setTemplatePreview("");
    }
  }, [templateType, templateTypes]);

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !date || !time || !templateType) {
      setError(
        "Please provide all required fields: file, date, time, and message template",
      );
      return;
    }

    const formData = new FormData();
    formData.append("excel_file", file);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("template_id", templateType.id); // Add template_id to the request

    setLoading(true);
    try {
      const response = await sendWhatsAppReminders(formData);
      console.log("Response:", response);
      setSuccess("Messages scheduled successfully");
      setError(null);
      setFile(null);
      setDate("");
      setTime("");
      setTemplateType(null); // Reset template selection
      setTemplatePreview(""); // Clear preview
      debouncedFetchMessages(search, statusFilter, page, rowsPerPage);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to schedule messages");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page on search
  };

  // Handle dialog open/close
  const handleOpenDialog = (message) => {
    setSelectedMessage(message);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMessage(null);
  };

  // Get status chip properties
  const getStatusChip = (status) => {
    const statusProps = {
      Scheduled: {
        color: themeColors.primary,
        bgcolor:
          theme === "dark"
            ? "rgba(74, 95, 165, 0.2)"
            : "rgba(74, 95, 165, 0.1)",
        icon: <Schedule fontSize="small" />,
      },
      Sent: {
        color: "#4caf50",
        bgcolor:
          theme === "dark"
            ? "rgba(76, 175, 80, 0.2)"
            : "rgba(76, 175, 80, 0.1)",
        icon: <CheckCircle fontSize="small" />,
      },
      Error: {
        color: themeColors.error,
        bgcolor: themeColors.errorBg,
        icon: <Error fontSize="small" />,
      },
      Skipped: {
        color: "#ff9800",
        bgcolor:
          theme === "dark"
            ? "rgba(255, 152, 0, 0.2)"
            : "rgba(255, 152, 0, 0.1)",
        icon: <Error fontSize="small" />,
      },
    };

    const props = statusProps[status] || {
      color: themeColors.textSecondary,
      bgcolor: themeColors.chipBg,
      icon: null,
    };

    return (
      <Chip
        label={status}
        size="small"
        icon={props.icon}
        sx={{
          color: props.color,
          bgcolor: props.bgcolor,
          fontWeight: 500,
          "& .MuiChip-icon": {
            color: props.color,
          },
        }}
      />
    );
  };

  // Get statistics
  const getStatistics = () => {
    const stats = {
      total: messages.length,
      scheduled: messages.filter((m) => m.status === "Scheduled").length,
      error: messages.filter((m) => m.status === "Error").length,
    };
    return stats;
  };

  const stats = getStatistics();

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, bgcolor: themeColors.background, mb: { xs: 10, md: 0 } }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: themeColors.textPrimary,
            fontWeight: 700,
          }}
          gutterBottom
        >
          Tax Reminder Messages
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4, width: "100%" }}>
        {[
          {
            label: "Total Messages",
            value: stats.total,
            icon: <Message sx={{ color: themeColors.primary }} />,
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: <Schedule sx={{ color: themeColors.primary }} />,
          },
          {
            label: "Errors",
            value: stats.error,
            icon: <Error sx={{ color: themeColors.error }} />,
          },
        ].map((stat, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={2.4}
            key={index}
            sx={{ width: { md: "31%", xs: "100%" } }}
          >
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                bgcolor: themeColors.background,
                border: 1,
                borderColor: themeColors.border,
              }}
            >
              <Avatar
                sx={{
                  bgcolor:
                    theme === "dark"
                      ? "rgba(74, 95, 165, 0.2)"
                      : "rgba(74, 95, 165, 0.1)",
                  mx: "auto",
                  mb: 1,
                  width: 48,
                  height: 48,
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color:
                    stat.label === "Errors"
                      ? themeColors.error
                      : themeColors.primary,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: themeColors.textPrimary }}
              >
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload Form */}
      <Card
        sx={{
          mb: 4,
          overflow: "visible",
          bgcolor: themeColors.background,
          border: 1,
          borderColor: themeColors.border,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                bgcolor:
                  theme === "dark"
                    ? "rgba(74, 95, 165, 0.2)"
                    : "rgba(74, 95, 165, 0.1)",
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <Upload sx={{ color: themeColors.primary }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ color: themeColors.textPrimary }}
              >
                Schedule New Reminders
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: themeColors.textSecondary }}
              >
                Upload an Excel file with client details and schedule reminder
                messages
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, bgcolor: themeColors.border }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="flex-start"
              sx={{ mb: 3 }}
            >
              {/* Excel File */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: themeColors.primary, fontWeight: 600 }}
                >
                  Excel File
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    border: "2px dashed",
                    borderColor: file
                      ? themeColors.primary
                      : themeColors.border,
                    bgcolor: file
                      ? theme === "dark"
                        ? "rgba(74, 95, 165, 0.1)"
                        : "rgba(74, 95, 165, 0.05)"
                      : "transparent",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: themeColors.primary,
                      bgcolor:
                        theme === "dark"
                          ? "rgba(74, 95, 165, 0.1)"
                          : "rgba(74, 95, 165, 0.05)",
                    },
                  }}
                >
                  <Input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => setFile(e.target.files[0])}
                    sx={{ display: "none" }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Upload sx={{ color: themeColors.primary }} />
                      <Typography
                        variant="body2"
                        sx={{ color: themeColors.primary }}
                      >
                        {file ? file.name : "Click to upload Excel file"}
                      </Typography>
                    </Box>
                  </label>
                </Paper>
              </Box>

              {/* WhatsApp Message Template Type */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: themeColors.primary, fontWeight: 600 }}
                >
                  Message Template Type *
                </Typography>
                <TextField
                  select
                  value={templateType?.id || ""}
                  onChange={(e) => {
                    const selected = templateTypes.find(
                      (t) => t.id === parseInt(e.target.value),
                    );
                    setTemplateType(selected);
                  }}
                  fullWidth
                  required
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          bgcolor: themeColors.background,
                          "& option": {
                            color: themeColors.textPrimary,
                            backgroundColor: themeColors.background,
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: themeColors.textPrimary,
                      "& fieldset": { borderColor: themeColors.border },
                      "&:hover fieldset": { borderColor: themeColors.primary },
                      "&.Mui-focused fieldset": {
                        borderColor: themeColors.primary,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: themeColors.textSecondary,
                    },
                  }}
                >
                  <option value="">Select Template Type</option>
                  {templateTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}{" "}
                      {type.description ? `- ${type.description}` : ""}
                    </option>
                  ))}
                </TextField>
              </Box>

              {/* Schedule Date */}
              <Box
                sx={{ flex: 1, minWidth: 0, position: "relative", zIndex: 20 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: themeColors.primary, fontWeight: 600 }}
                >
                  Schedule Date
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8.5px 14px",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: `1px solid ${themeColors.border}`,
                      backgroundColor: themeColors.background,
                      color: themeColors.textPrimary,
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      colorScheme: theme === "dark" ? "dark" : "light",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = themeColors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = themeColors.border)
                    }
                  />
                </Box>
              </Box>

              {/* Schedule Time */}
              <Box
                sx={{ flex: 1, minWidth: 0, position: "relative", zIndex: 20 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: themeColors.primary, fontWeight: 600 }}
                >
                  Schedule Time
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8.5px 14px",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: `1px solid ${themeColors.border}`,
                      backgroundColor: themeColors.background,
                      color: themeColors.textPrimary,
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      colorScheme: theme === "dark" ? "dark" : "light",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = themeColors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = themeColors.border)
                    }
                  />
                </Box>
              </Box>
            </Stack>

            {/* Template Preview - Fixed to show when template is selected */}
            {(templatePreview || templateType) && (
              <Paper
                variant="outlined"
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor:
                    theme === "dark"
                      ? "rgba(74, 95, 165, 0.1)"
                      : "rgba(74, 95, 165, 0.05)",
                  borderLeft: `4px solid ${themeColors.primary}`,
                  borderColor: themeColors.border,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Visibility
                    sx={{ color: themeColors.primary, mr: 1, fontSize: 20 }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: themeColors.primary, fontWeight: 600 }}
                  >
                    Template Preview
                  </Typography>
                  {loadingTemplate && (
                    <CircularProgress
                      size={16}
                      sx={{ ml: 2, color: themeColors.primary }}
                    />
                  )}
                </Box>
                <Divider sx={{ mb: 2, bgcolor: themeColors.border }} />
                <Box
                  sx={{
                    p: 2,
                    bgcolor: themeColors.background,
                    borderRadius: 1,
                    border: `1px solid ${themeColors.border}`,
                    maxHeight: "200px",
                    overflow: "auto",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: themeColors.primary,
                      borderRadius: "3px",
                    },
                  }}
                >
                  {loadingTemplate ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 4 }}
                    >
                      <CircularProgress
                        size={24}
                        sx={{ color: themeColors.primary }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        color: themeColors.textPrimary,
                        wordBreak: "break-word",
                      }}
                    >
                      {templatePreview || "Select a template to see preview"}
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !file || !date || !time || !templateType}
              startIcon={
                loading ? (
                  <CircularProgress
                    size={20}
                    sx={{ color: themeColors.textPrimary }}
                  />
                ) : (
                  <Send />
                )
              }
              sx={{
                bgcolor: themeColors.primary,
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                color: themeColors.textPrimary,
                "&:hover": {
                  bgcolor: themeColors.primaryHover,
                },
                "&:disabled": {
                  bgcolor:
                    theme === "dark"
                      ? "rgba(74, 95, 165, 0.3)"
                      : "rgba(74, 95, 165, 0.5)",
                  color: themeColors.disabled,
                },
              }}
            >
              {loading ? "Scheduling Messages..." : "Schedule Reminders"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: themeColors.background,
          border: 1,
          borderColor: themeColors.border,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              bgcolor: themeColors.background,
              border: 1,
              borderColor: themeColors.border,
              borderRadius: 1,
              px: 2,
              py: 1,
              minWidth: { xs: "100%", md: 300 },
            }}
          >
            <Search sx={{ color: themeColors.textPrimary, mr: 1 }} />
            <TextField
              placeholder="Search by phone, PAN, or name..."
              value={search}
              onChange={handleSearchChange}
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                color: themeColors.textPrimary,
                "& .MuiInputBase-input": {
                  fontSize: "0.95rem",
                  color: themeColors.textPrimary,
                },
              }}
            />
          </Box>

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 200,
              color: themeColors.textPrimary,
              bgcolor: themeColors.background,
              "& .MuiOutlinedInput-root": {
                color: themeColors.textPrimary,
                bgcolor: themeColors.background,
                "& fieldset": {
                  borderColor: themeColors.border,
                },
                "&:hover fieldset": {
                  borderColor: themeColors.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: themeColors.primary,
                },
                "& select": {
                  color: themeColors.textPrimary,
                  backgroundColor: themeColors.background,
                  appearance: "none",
                  MozAppearance: "none",
                  WebkitAppearance: "none",
                  paddingRight: "24px",
                },
                "& .MuiSelect-icon": {
                  color: themeColors.textPrimary,
                },
                "& select::-ms-expand": {
                  display: "none",
                },
              },
              "& .MuiPaper-root": {
                bgcolor: themeColors.background,
                color: themeColors.textPrimary,
                "& .MuiMenuItem-root": {
                  color: themeColors.textPrimary,
                  backgroundColor: themeColors.background,
                  "&:hover": {
                    backgroundColor: themeColors.hoverBg,
                  },
                },
              },
            }}
            SelectProps={{
              native: true,
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: themeColors.background,
                    "& option": {
                      color: themeColors.textPrimary,
                      backgroundColor: themeColors.background,
                      "&:hover": {
                        backgroundColor: themeColors.hoverBg,
                      },
                    },
                  },
                },
              },
            }}
          >
            <option value="">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Sent">Sent</option>
            <option value="Error">Error</option>
            <option value="Skipped">Skipped</option>
          </TextField>

          <Tooltip title="Refresh data">
            <IconButton
              onClick={() =>
                debouncedFetchMessages(search, statusFilter, page, rowsPerPage)
              }
              disabled={loading}
              sx={{
                color: themeColors.primary,
                "&:hover": {
                  bgcolor:
                    theme === "dark"
                      ? "rgba(74, 95, 165, 0.2)"
                      : "rgba(74, 95, 165, 0.1)",
                },
                "&:disabled": {
                  color: themeColors.disabled,
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Success/Error Messages */}
      <Fade in={Boolean(success || error)} timeout={300}>
        <Box sx={{ mb: 3 }}>
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                bgcolor:
                  theme === "dark"
                    ? "rgba(76, 175, 80, 0.2)"
                    : "rgba(76, 175, 80, 0.1)",
                color: themeColors.textPrimary,
              }}
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                bgcolor: themeColors.errorBg,
                color: themeColors.textPrimary,
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Messages Table */}
      <Paper
        sx={{
          overflow: "hidden",
          bgcolor: "white",
          border: 1,
          borderColor: themeColors.border,
        }}
      >
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="tax reminder messages table">
            <TableHead>
              <TableRow>
                {[
                  "ID",
                  "Phone Number",
                  "PAN",
                  "Name",
                  "Message",
                  "Status",
                  "Scheduled",
                  "Sent",
                  "Error",
                ].map((header, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      bgcolor: themeColors.tableHeaderBg,
                      fontWeight: 600,
                      color: themeColors.textPrimary,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress
                      sx={{ color: themeColors.primary }}
                      size={40}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 2, color: themeColors.textSecondary }}
                    >
                      Loading messages...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !messages || messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Message
                      sx={{
                        fontSize: 48,
                        color: themeColors.textSecondary,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: themeColors.textSecondary, mb: 1 }}
                    >
                      No messages found
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: themeColors.textSecondary }}
                    >
                      {search || statusFilter
                        ? "Try adjusting your search filters"
                        : "Upload an Excel file to get started"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message, index) => (
                  <TableRow
                    key={message.id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor:
                          theme === "dark" ? "#2a2a2a" : "#f8f9ff",
                      },
                      "&:nth-of-type(even)": {
                        backgroundColor: theme === "dark" ? "#1a1a1a" : "white",
                      },
                      "&:hover": {
                        backgroundColor: theme === "dark" ? "#333" : "#f0f2ff",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      {message.id}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Phone
                          sx={{
                            mr: 1,
                            color: themeColors.primary,
                            fontSize: 18,
                          }}
                        />
                        <Typography
                          sx={{ color: theme === "dark" ? "white" : "black" }}
                        >
                          {message.phone_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      {message.pan}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person
                          sx={{
                            mr: 1,
                            color: themeColors.primary,
                            fontSize: 18,
                          }}
                        />
                        <Typography
                          sx={{ color: theme === "dark" ? "white" : "black" }}
                        >
                          {message.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleOpenDialog(message)}
                        sx={{
                          borderColor: themeColors.primary,
                          color: themeColors.primary,
                          "&:hover": {
                            borderColor: themeColors.primary,
                            bgcolor:
                              theme === "dark"
                                ? "rgba(74, 95, 165, 0.2)"
                                : "rgba(74, 95, 165, 0.1)",
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell>{getStatusChip(message.status)}</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary }}>
                      {message.scheduled_time
                        ? new Date(message.scheduled_time).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary }}>
                      {message.sent_time
                        ? new Date(message.sent_time).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {message.error_message ? (
                        <Tooltip title={message.error_message}>
                          <Chip
                            label="View Error"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{
                              borderColor: themeColors.error,
                              color: themeColors.error,
                              "&:hover": {
                                bgcolor: themeColors.errorBg,
                              },
                            }}
                            clickable
                          />
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: 1,
            borderColor: themeColors.border,
            bgcolor: theme === "dark" ? "#2a2a2a" : "#f8f9ff",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: "black",
                fontSize: "0.875rem",
              },
            "& .MuiTablePagination-selectIcon": {
              color: "black",
            },
          }}
        />
      </Paper>

      {/* Message Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: themeColors.background,
            border: 1,
            borderColor: themeColors.border,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: themeColors.border,
            pb: 2,
            bgcolor: themeColors.background,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor:
                  theme === "dark"
                    ? "rgba(74, 95, 165, 0.2)"
                    : "rgba(74, 95, 165, 0.1)",
                mr: 2,
              }}
            >
              <Message sx={{ color: themeColors.primary }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ color: themeColors.textPrimary }}
              >
                Message Details
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: themeColors.textSecondary }}
              >
                {selectedMessage?.name} • {selectedMessage?.phone_number}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: themeColors.textPrimary }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: themeColors.background }}>
          <Paper
            sx={{
              p: 3,
              bgcolor:
                theme === "dark"
                  ? "rgba(74, 95, 165, 0.1)"
                  : "rgba(74, 95, 165, 0.05)",
              border: "1px solid",
              borderColor:
                theme === "dark"
                  ? "rgba(74, 95, 165, 0.3)"
                  : "rgba(74, 95, 165, 0.2)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: themeColors.primary, fontWeight: 600 }}
            >
              WhatsApp Message:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                color: themeColors.textPrimary,
              }}
            >
              {selectedMessage?.message || "No message content available"}
            </Typography>
          </Paper>

          {selectedMessage?.error_message && (
            <Paper
              sx={{
                p: 3,
                mt: 2,
                bgcolor: themeColors.errorBg,
                border: "1px solid",
                borderColor:
                  theme === "dark"
                    ? "rgba(244, 67, 54, 0.3)"
                    : "rgba(244, 67, 54, 0.2)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: themeColors.error, fontWeight: 600 }}
              >
                Error Message:
              </Typography>
              <Typography variant="body2" sx={{ color: themeColors.error }}>
                {selectedMessage.error_message}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: themeColors.border,
            bgcolor: themeColors.background,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              bgcolor: themeColors.primary,
              color: themeColors.textPrimary,
              "&:hover": {
                bgcolor: themeColors.primaryHover,
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaxReminderMessages;
