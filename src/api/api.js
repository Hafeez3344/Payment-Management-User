import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment/moment";

export const BACKEND_URL = "http://46.202.166.64:8080";
// export const BACKEND_URL = "https://payment-management-backend";



// ------------------------------------- User Login api ------------------------------------
export const fn_loginUserApi = async (data) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/user/login`, data);
        if (response?.status === 200) {
            let message;
            if (response?.data?.type === "merchant") {
                message = "Merchant Logged in successfully";
            } else {
                message = "Logged in successfully";
            }
            return { 
                status: true, 
                message: message,
                data: response?.data
            };
        }
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// -------------------------------- Create Payment api----------------------------------------
export const fn_createPaymentApi = async (data) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/payment/create`, data);
        return {
            status: true,
            message: "Payment created successfully",
            data: response.data
        };
    } catch (error) {
        return { status: false, message: "Network Error" };
    }
}   

// -------------------------------- get User  Payment api----------------------------------------
export const fn_getUserPaymentApi = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const userId = Cookies.get("userId");
        const response = await axios.get(`${BACKEND_URL}/payment/get/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            status: true,
            message: "Payment fetched successfully",
            data: response.data || []
        };
    } catch (error) {
        return { status: false, message: "Network Error" };
    }
}









































































// -------------------------------- get All Merchant api----------------------------------------
export const fn_getAllMerchantApi = async (status, pageNumber, merchant, searchQuery, searchTrnId, bankId, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams();

        // Add required parameters
        queryParams.append("page", pageNumber || 1);
        queryParams.append("type", "manual");

        // Add optional parameters only if they have values
        if (status) queryParams.append("status", status);
        if (merchant) queryParams.append("trnStatus", merchant);
        if (searchQuery) queryParams.append("search", searchQuery);
        if (searchTrnId) queryParams.append("trnNo", searchTrnId);
        if (bankId) queryParams.append("bankId", bankId);

        // Add date range parameters if provided
        if (dateRange?.startDate) {
            console.log('Adding startDate to query:', dateRange.startDate);
            queryParams.append("startDate", dateRange.startDate);
        }
        if (dateRange?.endDate) {
            console.log('Adding endDate to query:', dateRange.endDate);
            queryParams.append("endDate", dateRange.endDate);
        }
        // {moment.utc(selectedTransaction?.createdAt).format('DD MMM YYYY, hh:mm A')}

        const url = `${BACKEND_URL}/ledger/getAllMerchant?${queryParams.toString()}`;
        console.log('Making API request to:', url);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data,
        };
    } catch (error) {
        console.error("API Error:", error.response || error);
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "No transaction found",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

// -----------------------------------Verified Transactions api---------------------------------
export const fn_getAllVerifiedTransactionApi = async (status) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/ledger/cardMerchantData?status=${status}&filter=all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        console.log(response);
        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data?.data,
        };
    } catch (error) {
        console.error(error);

        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

// -----------------------------------Get All Transactions api---------------------------------
export const fn_getAllTransactionApi = async (bankId) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/ledger/cardMerchantData${bankId ? `&bankId=${bankId}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        console.log(response);
        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data?.data,
        };
    } catch (error) {
        console.error(error);

        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//------------------------------------Get Card Data By Status API---------------------------------------------
export const fn_getCardDataByStatus = async (status, filter, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams({
            status: status,
            filter: filter
        });

        // Format and add date range if provided
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');
            queryParams.append("startDate", startDate);
            queryParams.append("endDate", endDate);
        }

        const response = await axios.get(
            `${BACKEND_URL}/ledger/cardMerchantData?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};


export default BACKEND_URL;


