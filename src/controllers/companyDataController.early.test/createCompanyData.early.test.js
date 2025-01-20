// Unit tests for: createCompanyData

const { createCompanyData } = require("../companyDataController");
const CompanyData = require("../../models/companyDataModel");

// jest.mock("../../../src/models/companyDataModel");

describe("createCompanyData() createCompanyData method", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        company_name: "Test Company",
        company_description: "A test company description",
        company_website: "http://testcompany.com",
        company_logo: "http://testcompany.com/logo.png",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("Happy paths", () => {
    it("should create a new company data successfully", async () => {
      // Arrange
      const mockCompanyData = {
        save: jest.fn().mockResolvedValue(req.body),
      };
      CompanyData.mockImplementation(() => mockCompanyData);

      // Act
      await createCompanyData(req, res);

      // Assert
      expect(CompanyData).toHaveBeenCalledWith(req.body);
      expect(mockCompanyData.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Company data created successfully",
        data: req.body,
      });
    });
  });

  describe("Edge cases", () => {
    it("should return 400 if any required field is missing", async () => {
      // Arrange
      req.body.company_name = "";

      // Act
      await createCompanyData(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 500 if there is a server error", async () => {
      // Arrange
      const errorMessage = "Database error";
      const mockCompanyData = {
        save: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };
      CompanyData.mockImplementation(() => mockCompanyData);

      // Act
      await createCompanyData(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create company data",
        error: errorMessage,
      });
    });
  });
});

// End of unit tests for: createCompanyData
